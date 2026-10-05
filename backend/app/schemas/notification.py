"""Notification schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    report_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
