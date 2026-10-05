"""
Urgency Analyzer — estimates urgency 1–10 from report text.

Urgency = how time-sensitive the problem is (immediate danger, duration,
worsening, service disruption).
"""
from __future__ import annotations
import re
from app.ai.preprocessing.text_cleaner import clean_text


_URGENCY_SIGNALS: list[tuple[str, float]] = [
    # Immediate danger
    (r"\b(immediate|immediately|urgent|emergency|right now|asap)\b", 3.5),
    (r"\b(today|tonight|this morning|right now)\b", 2.5),
    # Duration — long-running = higher urgency
    (r"\b(\d+)\s*(week|weeks)\b", 2.5),
    (r"\b(\d+)\s*(month|months)\b", 3.0),
    (r"\b(year|years|long time|for a long)\b", 2.5),
    (r"\b(\d+)\s*(day|days)\b", 1.5),
    # Worsening
    (r"\b(worsening|getting worse|spreading|increasing|escalat)\b", 2.0),
    (r"\b(still|continue|continues|ongoing|persist|unresolved)\b", 1.5),
    # Essential service disruption
    (r"\b(no water|no electricity|no power|no supply)\b", 2.5),
    (r"\b(blocked|broken|non.functional|out of order|not working)\b", 1.5),
    # Safety
    (r"\b(accident|injury|dangerous|unsafe|hazard)\b", 2.5),
    (r"\b(children|school|hospital|patient)\b", 1.5),
]

_BASE_URGENCY = 3.0
_MAX_URGENCY = 10.0


def calculate_urgency(title: str, description: str) -> float:
    combined = clean_text(f"{title} {description}")
    score = _BASE_URGENCY

    for pattern, contrib in _URGENCY_SIGNALS:
        if re.search(pattern, combined):
            score += contrib

    return round(min(score, _MAX_URGENCY), 1)
