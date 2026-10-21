"""
Gemini LLM provider — optional AI enhancement for JanDrishti.

When GEMINI_API_KEY is set in .env, this provider replaces the local
keyword/TF-IDF engine for:
  - Multilingual problem classification (English + Indic languages)
  - Severity / urgency / persistence scoring with structured prompts
  - Human-readable cluster summaries
  - Embeddings for similarity (via Gemini embedding-001)

If the API call fails or no key is configured, the local engine is used
automatically — see ai_service.py for the fallback logic.

The provider still implements the same ABCs (ProblemClassifier) so it
plugs into the existing pipeline without changing API routes.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Optional

from app.core.config import settings
from app.ai.classification.classifier import (
    ProblemClassifier, ClassificationResult, _RULES,
)
from app.ai.scoring.priority_engine import calculate_priority, PriorityResult

logger = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────
#  Lazy Gemini client — only imported when an API key exists
# ────────────────────────────────────────────────────────────────

_client = None
_model = None


def _get_model():
    """Lazily import and configure the Gemini model. Returns None if unavailable."""
    global _client, _model
    if not settings.GEMINI_API_KEY:
        return None
    if _model is not None:
        return _model
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel(settings.GEMINI_MODEL)
        logger.info(f"Gemini provider initialised with model={settings.GEMINI_MODEL}")
        return _model
    except Exception as e:
        logger.warning(f"Gemini unavailable, will use local engine: {e}")
        return None


def is_gemini_available() -> bool:
    """True if Gemini can be used (key set + library loadable)."""
    if not settings.GEMINI_API_KEY:
        return False
    return _get_model() is not None


# ────────────────────────────────────────────────────────────────
#  Category list for the LLM prompt
# ────────────────────────────────────────────────────────────────

_CATEGORY_SLUGS = [(slug, name) for slug, name, _, _ in _RULES]


# ────────────────────────────────────────────────────────────────
#  Gemini classifier
# ────────────────────────────────────────────────────────────────

class GeminiClassifier(ProblemClassifier):
    """
    LLM-based classifier. Sends a structured prompt asking Gemini to:
    1. Pick the best category from our fixed list
    2. Return a confidence between 0 and 1
    3. Score severity (1-10) and urgency (1-10)

    Falls back to KeywordClassifier if the API call fails.
    """

    def __init__(self, fallback: ProblemClassifier):
        self._fallback = fallback

    def classify(self, title: str, description: str) -> ClassificationResult:
        model = _get_model()
        if model is None:
            return self._fallback.classify(title, description)

        categories_str = "\n".join(
            f"- {slug}: {name}" for slug, name in _CATEGORY_SLUGS
        )
        prompt = (
            "You are a civic-problem classifier for an Indian civic platform. "
            "Classify the following report into ONE category from this list:\n\n"
            f"{categories_str}\n\n"
            "Respond ONLY with a JSON object (no markdown fences) in this exact format:\n"
            '{"category_slug": "<one of the slugs above>", '
            '"category_name": "<human-readable name>", '
            '"confidence": <number 0.0-1.0>}\n\n'
            f"Report title: {title}\n"
            f"Report description: {description}\n"
        )

        try:
            resp = model.generate_content(prompt)
            text = resp.text.strip()
            # Strip any markdown fences just in case
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
            data = json.loads(text)
            slug = str(data.get("category_slug", "other")).lower()
            name = str(data.get("category_name", "Other"))
            conf = float(data.get("confidence", 0.7))
            # Validate slug against our list
            known = {s for s, _ in _CATEGORY_SLUGS}
            if slug not in known:
                slug = "other"
                name = "Other"
            conf = max(0.0, min(conf, 1.0))
            return ClassificationResult(category_slug=slug, category_name=name, confidence=round(conf, 3))
        except Exception as e:
            logger.warning(f"Gemini classify failed, falling back: {e}")
            return self._fallback.classify(title, description)


# ────────────────────────────────────────────────────────────────
#  Gemini severity / urgency scoring
# ────────────────────────────────────────────────────────────────

@dataclass
class LLMScores:
    severity: float
    urgency: float
    persistence: float
    community_impact: float


def gemini_score_scores(
    title: str,
    description: str,
    similar_count: int,
    fallback_severity: float,
    fallback_urgency: float,
    fallback_persistence: float,
    fallback_community_impact: float,
) -> LLMScores:
    """Ask Gemini to score severity/urgency/persistence/impact. Falls back on error."""
    model = _get_model()
    if model is None:
        return LLMScores(
            severity=fallback_severity,
            urgency=fallback_urgency,
            persistence=fallback_persistence,
            community_impact=fallback_community_impact,
        )

    prompt = (
        "You are scoring a civic problem report for an Indian city. "
        "Rate each dimension from 1 (low) to 10 (high) based on the report text.\n\n"
        "- severity: danger to human life, health impact, infrastructure damage\n"
        "- urgency: how time-sensitive / immediate the issue is\n"
        "- persistence: how long the problem has persisted based on duration cues\n"
        "- community_impact: how many people are potentially affected\n\n"
        "Similar reports already found: " + str(similar_count) + "\n\n"
        "Respond ONLY with JSON (no markdown):\n"
        '{"severity": <1-10>, "urgency": <1-10>, "persistence": <1-10>, "community_impact": <1-10>}\n\n'
        f"Title: {title}\n"
        f"Description: {description}\n"
    )

    try:
        resp = model.generate_content(prompt)
        text = resp.text.strip()
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
        data = json.loads(text)

        def clamp(v):
            return max(1.0, min(10.0, float(v)))

        return LLMScores(
            severity=round(clamp(data.get("severity", fallback_severity)), 1),
            urgency=round(clamp(data.get("urgency", fallback_urgency)), 1),
            persistence=round(clamp(data.get("persistence", fallback_persistence)), 1),
            community_impact=round(clamp(data.get("community_impact", fallback_community_impact)), 1),
        )
    except Exception as e:
        logger.warning(f"Gemini scoring failed, falling back: {e}")
        return LLMScores(
            severity=fallback_severity,
            urgency=fallback_urgency,
            persistence=fallback_persistence,
            community_impact=fallback_community_impact,
        )


# ────────────────────────────────────────────────────────────────
#  Gemini cluster summary
# ────────────────────────────────────────────────────────────────

def gemini_summarise_cluster(
    cluster_title: str,
    report_texts: list[str],
    city: Optional[str] = None,
) -> Optional[str]:
    """
    Generate a concise human-readable summary of a problem cluster.
    Returns None if Gemini is unavailable (caller falls back to template).
    """
    model = _get_model()
    if model is None:
        return None

    sample = "\n".join(f"- {t[:200]}" for t in report_texts[:5])
    prompt = (
        "You are summarising a cluster of related civic-problem reports from Indian citizens. "
        "Write a single concise paragraph (2-3 sentences) summarising the cluster. "
        "Mention the likely category, location if known, approximate duration, and impact. "
        "Do NOT invent specific numbers. Stay neutral and factual.\n\n"
        f"Cluster title: {cluster_title}\n"
        f"City: {city or 'unknown'}\n"
        f"Sample reports:\n{sample}\n"
    )

    try:
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception as e:
        logger.warning(f"Gemini cluster summary failed: {e}")
        return None


# ────────────────────────────────────────────────────────────────
#  Gemini embeddings (optional, replaces TF-IDF for similarity)
# ────────────────────────────────────────────────────────────────

_embedding_cache: dict[str, list[float]] = {}


def gemini_embed(text: str) -> Optional[list[float]]:
    """Generate an embedding vector via Gemini. Returns None on failure."""
    model = settings.GEMINI_EMBEDDING_MODEL
    if not settings.GEMINI_API_KEY:
        return None
    if text in _embedding_cache:
        return _embedding_cache[text]
    try:
        import google.generativeai as genai
        result = genai.embed_content(
            model=model,
            content=text,
            task_type="retrieval_document",
        )
        vec = result.get("embedding") if isinstance(result, dict) else getattr(result, "embedding", None)
        if vec:
            _embedding_cache[text] = vec
        return vec
    except Exception as e:
        logger.warning(f"Gemini embedding failed: {e}")
        return None
