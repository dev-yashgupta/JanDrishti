"""
Priority Engine — combines all sub-scores into a final 0–100 priority score.

Formula (transparent, configurable):
  raw = severity*w1 + urgency*w2 + frequency*w3 + community_impact*w4 + persistence*w5
  priority_score = round(raw * 10)   # each sub-score is 1–10, result 0–100

Priority levels:
  0–24   LOW
  25–49  MEDIUM
  50–74  HIGH
  75–100 CRITICAL
"""
from __future__ import annotations
from dataclasses import dataclass
from app.core.config import settings


@dataclass
class PriorityResult:
    severity: float
    urgency: float
    frequency: float
    community_impact: float
    persistence: float
    priority_score: float        # 0–100
    priority_level: str          # LOW / MEDIUM / HIGH / CRITICAL
    reasoning: str


def score_to_level(score: float) -> str:
    if score >= 75:
        return "CRITICAL"
    if score >= 50:
        return "HIGH"
    if score >= 25:
        return "MEDIUM"
    return "LOW"


def build_reasoning(
    severity: float,
    urgency: float,
    frequency: float,
    community_impact: float,
    persistence: float,
    level: str,
) -> str:
    reasons: list[str] = []
    if severity >= 8:
        reasons.append("high severity indicating significant harm")
    if urgency >= 8:
        reasons.append("high urgency suggesting time-sensitive conditions")
    if frequency >= 7:
        reasons.append("multiple similar reports confirm community concern")
    if community_impact >= 7:
        reasons.append("large community impact")
    if persistence >= 7:
        reasons.append("prolonged duration without resolution")
    if not reasons:
        reasons.append("standard civic issue assessed by keyword analysis")
    base = f"Priority level {level}: " + "; ".join(reasons) + "."
    base += " AI analysis is advisory — please verify before action."
    return base


def calculate_priority(
    severity: float,
    urgency: float,
    frequency: float,
    community_impact: float,
    persistence: float,
) -> PriorityResult:
    w = {
        "severity": settings.PRIORITY_WEIGHT_SEVERITY,
        "urgency": settings.PRIORITY_WEIGHT_URGENCY,
        "frequency": settings.PRIORITY_WEIGHT_FREQUENCY,
        "community_impact": settings.PRIORITY_WEIGHT_COMMUNITY_IMPACT,
        "persistence": settings.PRIORITY_WEIGHT_PERSISTENCE,
    }
    raw = (
        severity * w["severity"]
        + urgency * w["urgency"]
        + frequency * w["frequency"]
        + community_impact * w["community_impact"]
        + persistence * w["persistence"]
    )
    score = round(min(max(raw * 10, 0), 100), 1)
    level = score_to_level(score)
    reasoning = build_reasoning(severity, urgency, frequency, community_impact, persistence, level)

    return PriorityResult(
        severity=severity,
        urgency=urgency,
        frequency=frequency,
        community_impact=community_impact,
        persistence=persistence,
        priority_score=score,
        priority_level=level,
        reasoning=reasoning,
    )
