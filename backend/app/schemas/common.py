"""Common / shared response schemas."""
from typing import Optional
from pydantic import BaseModel


class APIError(BaseModel):
    detail: str
    status_code: Optional[int] = None


class SuccessResponse(BaseModel):
    message: str
    success: bool = True


class MediaUploadResponse(BaseModel):
    id: str
    url: str
    media_type: str
    filename: str
