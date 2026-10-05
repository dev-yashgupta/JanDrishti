"""
Problem classifier — predicts category from report text.

Architecture:
  ProblemClassifier (abstract interface)
  └── KeywordClassifier   ← implemented here (no external deps)
      Future replacements: TFIDFClassifier, BERTClassifier, LLMClassifier

The classifier is isolated behind the ProblemClassifier ABC so the entire
AI backend can be swapped without touching API routes.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
import re

from app.ai.preprocessing.text_cleaner import clean_text


@dataclass
class ClassificationResult:
    category_slug: str
    category_name: str
    confidence: float


class ProblemClassifier(ABC):
    """Abstract interface — swap implementations without touching callers."""

    @abstractmethod
    def classify(self, title: str, description: str) -> ClassificationResult:
        ...


# ── Keyword rules ─────────────────────────────────────────────
# Each entry: (category_slug, category_name, weight, [keywords])
# Weight lets high-confidence keywords dominate.
_RULES: list[tuple[str, str, float, list[str]]] = [
    ("roads-infrastructure", "Roads & Infrastructure", 1.0, [
        "pothole", "road", "road damage", "road collapse", "road broken",
        "bridge", "footpath", "pavement", "flyover", "highway", "street",
        "crater", "bump", "divider", "signal", "traffic light", "underpass",
        "overbridge", "road repair", "road construction", "road block",
        "accident", "vehicle damage", "road accident",
    ]),
    ("water-supply", "Water Supply", 1.1, [
        "water", "drinking water", "tap water", "water supply", "pipeline",
        "water pipe", "no water", "water cut", "contaminated water",
        "dirty water", "brown water", "water leakage", "water pressure",
        "water connection", "borewell", "hand pump", "water shortage",
        "water board", "pani", "jal",
    ]),
    ("sanitation-waste", "Sanitation & Waste", 1.0, [
        "garbage", "waste", "trash", "litter", "dump", "overflowing",
        "stench", "smell", "rubbish", "open defecation", "toilet",
        "public toilet", "sanitation", "sewage", "sewer overflow",
        "blocked drain", "solid waste", "waste collection", "dustbin",
        "open dump", "municipal waste",
    ]),
    ("healthcare", "Healthcare", 1.1, [
        "hospital", "clinic", "doctor", "medicine", "medical", "health",
        "ambulance", "emergency", "patient", "treatment", "primary health",
        "dispensary", "pharmacy", "nurse", "disease", "epidemic", "infection",
        "blood", "surgery", "health centre",
    ]),
    ("education", "Education", 1.0, [
        "school", "college", "teacher", "student", "education", "classroom",
        "books", "mid day meal", "hostel", "scholarship", "university",
        "dropout", "anganwadi", "primary school", "high school",
    ]),
    ("electricity", "Electricity", 1.0, [
        "electricity", "power", "power cut", "load shedding", "blackout",
        "streetlight", "street light", "pole", "wire", "transformer",
        "voltage", "electric", "meter", "wiring", "power supply", "bijli",
    ]),
    ("public-safety", "Public Safety", 1.2, [
        "crime", "theft", "robbery", "assault", "harassment", "unsafe",
        "danger", "security", "police", "ccpv", "cctv", "dark area",
        "isolated", "gang", "fighting", "eve teasing", "domestic violence",
    ]),
    ("environment", "Environment", 1.0, [
        "pollution", "tree", "deforestation", "air quality", "smoke",
        "burning", "chemical", "toxic", "factory", "industrial", "noise",
        "dust", "green cover", "park", "garden", "illegal mining",
        "river pollution", "lake", "pond", "flood plain",
    ]),
    ("drainage-flooding", "Drainage & Flooding", 1.0, [
        "flood", "waterlogging", "drain", "drainage", "nala", "overflow",
        "blocked drain", "rainwater", "stagnant water", "mosquito",
        "dengue", "malaria", "waterlogged", "inundation", "low-lying",
    ]),
    ("public-transport", "Public Transport", 1.0, [
        "bus", "auto", "metro", "train", "transport", "route", "bus stop",
        "railway", "cab", "rickshaw", "public transport", "bus service",
        "timetable", "fare", "conductor", "driver",
    ]),
    ("housing", "Housing", 1.0, [
        "house", "housing", "slum", "shelter", "eviction", "demolition",
        "construction", "building", "flat", "colony", "displacement",
        "rent", "landlord", "homeless", "encroachment", "illegal building",
    ]),
]


class KeywordClassifier(ProblemClassifier):
    """
    Lightweight keyword-match classifier.
    Scores each category by counting keyword hits in the combined text,
    weighted by category importance.

    Replaceable with TF-IDF + Logistic Regression when scikit-learn
    becomes available for Python 3.14.
    """

    def classify(self, title: str, description: str) -> ClassificationResult:
        combined = clean_text(f"{title} {description}")

        scores: dict[str, float] = {}
        names: dict[str, str] = {}

        for slug, name, weight, keywords in _RULES:
            score = 0.0
            for kw in keywords:
                # Whole-word match for single words, substring for phrases
                pattern = rf"\b{re.escape(kw)}\b" if " " not in kw else re.escape(kw)
                hits = len(re.findall(pattern, combined))
                if hits:
                    # Phrase matches are worth more
                    phrase_bonus = 1.5 if " " in kw else 1.0
                    score += hits * phrase_bonus
            scores[slug] = score * weight
            names[slug] = name

        if not any(v > 0 for v in scores.values()):
            return ClassificationResult("other", "Other", 0.40)

        best_slug = max(scores, key=lambda k: scores[k])
        total = sum(scores.values())
        confidence = min(scores[best_slug] / total, 0.97) if total > 0 else 0.40

        # Clamp minimum confidence to something meaningful
        confidence = max(confidence, 0.42)

        return ClassificationResult(best_slug, names[best_slug], round(confidence, 3))


# Module-level singleton — callers import this
classifier = KeywordClassifier()
