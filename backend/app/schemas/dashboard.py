"""Dashboard / analytics schemas."""
from typing import List
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_reports: int
    unresolved: int
    critical: int
    high_priority: int
    in_progress: int
    resolved_this_month: int
    avg_resolution_days: float
    reports_today: int


class CitizenDashboardSummary(BaseModel):
    total_my_reports: int
    pending: int
    in_progress: int
    resolved: int
    high_priority: int


class CategoryStat(BaseModel):
    category: str
    count: int
    color: str


class StatusStat(BaseModel):
    status: str
    count: int


class PriorityStat(BaseModel):
    level: str
    count: int


class TimeSeriesPoint(BaseModel):
    date: str
    count: int


class CityStat(BaseModel):
    city: str
    state: str
    count: int


class AnalyticsResponse(BaseModel):
    by_category: List[CategoryStat]
    by_status: List[StatusStat]
    by_priority: List[PriorityStat]
    reports_over_time: List[TimeSeriesPoint]
    by_city: List[CityStat]
    avg_resolution_days: float
