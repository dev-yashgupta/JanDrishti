"""Problem cluster schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.category import CategoryResponse
from app.schemas.location import LocationResponse


class ClusterResponse(BaseModel):
    id: str
    title: str
    summary: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    location: Optional[LocationResponse] = None
    report_count: int
    total_support: int
    priority_score: float
    priority_level: str
    status: str
    representative_report_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedClusters(BaseModel):
    items: List[ClusterResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
