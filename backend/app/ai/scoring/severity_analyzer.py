"""
Severity Analyzer — estimates severity 1–10 from report text.

Severity = impact on human life, health, infrastructure and number affected.
"""
from __future__ import annotations
import re
from app.ai.preprocessing.text_cleaner import clean_text


# (pattern, score_contribution)
_SEVERITY_SIGNALS: list[tuple[str, float]] = [
    # Life-threatening
    (r"\b(death|died|fatal|kill|killed|casualty)\b", 4.0),
    (r"\b(injury|injured|accident|hurt|hospitalised|hospitaliz)\b", 3.0),
    # Health
    (r"\b(disease|epidemic|infection|outbreak|contaminated|toxic|poisoning)\b", 3.5),
    (r"\b(hospital|emergency|ambulance)\b", 2.5),
    # Infrastructure
    (r"\b(collapse|collapse[ds]|cave.in|sinkhole|explosion|fire)\b", 3.5),
    (r"\b(major|severe|critical|dangerous|hazardous|risk)\b", 2.0),
    (r"\b(flood|inundation|waterlogg)\b", 2.0),
    # Scale
    (r"\b(hundred|thousands?|lakhs?|many people|entire area|whole colony)\b", 2.5),
    (r"\b(children|elderly|disabled|pregnant|patient)\b", 2.0),
    # Moderate
    (r"\b(inconvenience|discomfort|problem|issue|broken|damaged)\b", 1.0),
    (r"\b(pothole|leakage|smell|stench|garbage|waste)\b", 1.2),
    (r"\b(no water|power cut|no electricity|no light)\b", 1.5),
]

_BASE_SEVERITY = 3.0
_MAX_SEVERITY = 10.0


def calculate_severity(title: str, description: str) -> float:
    combined = clean_text(f"{title} {description}")
    score = _BASE_SEVERITY

    for pattern, contrib in _SEVERITY_SIGNALS:
        if re.search(pattern, combined):
            score += contrib

    return round(min(score, _MAX_SEVERITY), 1)
