"""Report schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator

from app.schemas.category import CategoryResponse
from app.schemas.location import LocationResponse, LocationCreate
from app.schemas.user import UserPublic
from app.schemas.ai_analysis import AIAnalysisResponse


class MediaResponse(BaseModel):
    id: str
    url: str
    thumbnail_url: Optional[str] = None
    media_type: str
    filename: str
    size_bytes: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportCreate(BaseModel):
    title: str
    description: str
    category_id: str
    address: Optional[str] = None
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date_observed: Optional[datetime] = None
    contact_info: Optional[str] = None
    is_anonymous: bool = False

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Title must be at least 10 characters")
        if len(v) > 200:
            raise ValueError("Title must be under 200 characters")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if len(v.strip()) < 30:
            raise ValueError("Description must be at least 30 characters")
        if len(v) > 2000:
            raise ValueError("Description must be under 2000 characters")
        return v.strip()


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    contact_info: Optional[str] = None


class StatusChangeRequest(BaseModel):
    new_status: str
    note: Optional[str] = None

    @field_validator("new_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {
            "REPORTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED",
            "IN_PROGRESS", "RESOLVED", "CITIZEN_VERIFICATION", "CLOSED",
        }
        if v.upper() not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v.upper()


class AssignRequest(BaseModel):
    assigned_to_id: str
    department: Optional[str] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class CommentCreate(BaseModel):
    content: str
    is_internal: bool = False

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v.strip()) < 5:
            raise ValueError("Comment must be at least 5 characters")
        return v.strip()


class CommentResponse(BaseModel):
    id: str
    report_id: str
    author: Optional[UserPublic] = None
    content: str
    is_internal: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusHistoryResponse(BaseModel):
    id: str
    report_id: str
    old_status: Optional[str] = None
    new_status: str
    changed_by: Optional[UserPublic] = None
    note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority_level: str
    priority_score: Optional[float] = None
    category_id: str
    category: Optional[CategoryResponse] = None
    location: Optional[LocationResponse] = None
    reporter_id: str
    reporter: Optional[UserPublic] = None
    media: List[MediaResponse] = []
    ai_analysis: Optional[AIAnalysisResponse] = None
    support_count: int
    view_count: int
    date_observed: Optional[datetime] = None
    contact_info: Optional[str] = None
    is_anonymous: bool
    cluster_id: Optional[str] = None
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReportSummary(BaseModel):
    """Lightweight card view."""
    id: str
    title: str
    status: str
    priority_level: str
    priority_score: Optional[float] = None
    category: Optional[CategoryResponse] = None
    location: Optional[LocationResponse] = None
    support_count: int
    is_demo: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedReports(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
