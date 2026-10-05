"""AI Analysis schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PriorityBreakdown(BaseModel):
    severity: float
    urgency: float
    frequency: float
    community_impact: float
    persistence: float


class AIAnalysisResponse(BaseModel):
    id: str
    report_id: str
    predicted_category: Optional[str] = None
    category_confidence: Optional[float] = None
    severity_score: float
    urgency_score: float
    frequency_score: float
    community_impact_score: float
    persistence_score: float
    priority_score: float
    priority_level: str
    priority_breakdown: PriorityBreakdown
    reasoning: Optional[str] = None
    model_version: str
    processed_at: datetime

    model_config = {"from_attributes": True}
