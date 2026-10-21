"""
AIService — the single entry-point for all AI operations.

Exposes:
  analyze_report(title, description, lat, lon, existing_reports)
    → AnalysisResult

All sub-components (classifier, severity, urgency, similarity, priority)
are called through this service so they can be swapped independently.
"""
from __future__ import annotations
import json
import logging
from dataclasses import dataclass, field
from typing import Optional

from app.ai.classification.classifier import classifier, ClassificationResult
from app.ai.scoring.severity_analyzer import calculate_severity
from app.ai.scoring.urgency_analyzer import calculate_urgency
from app.ai.scoring.priority_engine import calculate_priority, PriorityResult
from app.ai.similarity.tfidf_engine import (
    similarity_engine, haversine_km, TFIDFSimilarityEngine,
)
from app.ai.llm.gemini_provider import (
    is_gemini_available, GeminiClassifier, gemini_score_scores, LLMScores,
)
from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class SimilarReport:
    report_id: str
    similarity_score: float
    distance_km: Optional[float] = None


@dataclass
class AnalysisResult:
    # Classification
    predicted_category_slug: str
    predicted_category_name: str
    category_confidence: float
    # Scores
    severity_score: float
    urgency_score: float
    frequency_score: float
    community_impact_score: float
    persistence_score: float
    # Priority
    priority_score: float
    priority_level: str
    reasoning: str
    # Similarity
    similar_reports: list[SimilarReport] = field(default_factory=list)
    model_version: str = "jd-nlp-v1.0"


def _estimate_community_impact(
    title: str,
    description: str,
    similar_count: int,
) -> float:
    """Combine text signals + number of similar reports."""
    import re
    from app.ai.preprocessing.text_cleaner import clean_text

    text = clean_text(f"{title} {description}")
    score = 3.0
    # Population-scale signals
    if re.search(r"\b(entire|whole|all|colony|area|ward|district)\b", text):
        score += 2.0
    if re.search(r"\b(hundred|thousand|lakh|many people|residents)\b", text):
        score += 2.5
    if re.search(r"\b(school|hospital|market|commercial)\b", text):
        score += 1.5
    # Similar reports add to perceived scale
    score += min(similar_count * 0.5, 3.0)
    return round(min(score, 10.0), 1)


def _estimate_persistence(description: str) -> float:
    """Estimate how long the problem has existed from text cues."""
    import re
    from app.ai.preprocessing.text_cleaner import clean_text

    text = clean_text(description)
    score = 2.0
    patterns = [
        (r"\b(\d+)\s*year", 5.0),
        (r"\b(\d+)\s*month", 3.5),
        (r"\bsince\s+last\b", 3.0),
        (r"\b(week|weeks)\b", 2.5),
        (r"\b(days|day)\b", 1.5),
        (r"\b(long time|months|still|ongoing|unresolved|continues|persist)\b", 3.0),
    ]
    for pattern, contrib in patterns:
        if re.search(pattern, text):
            score += contrib
    return round(min(score, 10.0), 1)


@dataclass
class _ExistingReport:
    """Lightweight DTO passed in for similarity checking."""
    id: str
    text: str           # title + description combined
    latitude: Optional[float]
    longitude: Optional[float]


class AIService:
    """
    Orchestrates all AI sub-components.
    Stateless by design — similarity engine is passed in to keep this
    unit-testable.

    Provider selection:
      AI_PROVIDER = "auto"   → use Gemini if GEMINI_API_KEY is set, else local
      AI_PROVIDER = "gemini" → require Gemini (falls back to local on error)
      AI_PROVIDER = "local"  → always use the pure-Python engine
    """

    def __init__(self, sim_engine: Optional[TFIDFSimilarityEngine] = None):
        self._sim = sim_engine or similarity_engine
        # Build the classifier chain — Gemini wraps the keyword classifier
        if settings.AI_PROVIDER in ("auto", "gemini") and is_gemini_available():
            self._classifier: ProblemClassifier = GeminiClassifier(fallback=classifier)
            logger.info("AIService using Gemini provider (with local fallback)")
        else:
            self._classifier = classifier
            logger.info("AIService using local provider")

    def warm_up(self, existing_reports: list[_ExistingReport]) -> None:
        """
        Fit the similarity engine on all existing reports.
        Call this once at application startup.
        """
        texts = [r.text for r in existing_reports]
        ids = [r.id for r in existing_reports]
        self._sim.fit(texts, ids)

    def analyze_report(
        self,
        title: str,
        description: str,
        latitude: Optional[float],
        longitude: Optional[float],
        existing_reports: list[_ExistingReport],
    ) -> AnalysisResult:
        """
        Full AI pipeline for a new report:
        1. Classify
        2. Severity
        3. Urgency
        4. Find similar (text + geography)
        5. Community impact (uses similar count)
        6. Persistence
        7. Priority score
        """
        combined_text = f"{title} {description}"

        # 1. Classification (Gemini if available, else keyword)
        cls: ClassificationResult = self._classifier.classify(title, description)

        # 2. Severity & urgency (local baseline always computed for fallback)
        severity = calculate_severity(title, description)
        urgency = calculate_urgency(title, description)

        # 3. Similar reports (text similarity, then optional geo filter)
        text_similar = self._sim.find_similar(
            combined_text,
            top_k=10,
            threshold=settings.SIMILARITY_THRESHOLD,
        )

        # Build id→location map for geo filtering
        loc_map: dict[str, tuple[float, float]] = {
            r.id: (r.latitude, r.longitude)
            for r in existing_reports
            if r.latitude is not None and r.longitude is not None
        }

        similar_reports: list[SimilarReport] = []
        for rep_id, sim_score in text_similar:
            distance_km: Optional[float] = None
            if latitude is not None and longitude is not None and rep_id in loc_map:
                lat2, lon2 = loc_map[rep_id]
                distance_km = round(haversine_km(latitude, longitude, lat2, lon2), 2)
                if distance_km > settings.SIMILARITY_RADIUS_KM:
                    continue  # too far away — skip from cluster
            similar_reports.append(
                SimilarReport(
                    report_id=rep_id,
                    similarity_score=sim_score,
                    distance_km=distance_km,
                )
            )

        # 4. Frequency — proportional to similar reports count (1–10)
        freq_raw = min(len(similar_reports) + 1, 10)
        frequency = round(1.0 + (freq_raw / 10.0) * 9.0, 1)

        # 5. Local estimates for community impact & persistence (fallback values)
        community_impact_local = _estimate_community_impact(
            title, description, len(similar_reports)
        )
        persistence_local = _estimate_persistence(description)

        # 5b. If Gemini is available, refine severity/urgency/persistence/impact
        if is_gemini_available():
            llm_scores: LLMScores = gemini_score_scores(
                title=title,
                description=description,
                similar_count=len(similar_reports),
                fallback_severity=severity,
                fallback_urgency=urgency,
                fallback_persistence=persistence_local,
                fallback_community_impact=community_impact_local,
            )
            severity = llm_scores.severity
            urgency = llm_scores.urgency
            persistence = llm_scores.persistence
            community_impact = llm_scores.community_impact
        else:
            community_impact = community_impact_local
            persistence = persistence_local

        # 7. Priority
        priority: PriorityResult = calculate_priority(
            severity, urgency, frequency, community_impact, persistence
        )

        # Add new document to engine for future lookups
        self._sim.add_document(combined_text, f"__pending__{id(combined_text)}")

        return AnalysisResult(
            predicted_category_slug=cls.category_slug,
            predicted_category_name=cls.category_name,
            category_confidence=cls.confidence,
            severity_score=severity,
            urgency_score=urgency,
            frequency_score=frequency,
            community_impact_score=community_impact,
            persistence_score=persistence,
            priority_score=priority.priority_score,
            priority_level=priority.priority_level,
            reasoning=priority.reasoning,
            similar_reports=similar_reports,
        )


# Module-level singleton
ai_service = AIService()
