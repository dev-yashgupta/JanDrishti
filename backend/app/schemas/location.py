"""Location schemas."""
from typing import Optional
from pydantic import BaseModel


class LocationCreate(BaseModel):
    address: Optional[str] = None
    city: str
    district: Optional[str] = None
    state: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float


class LocationResponse(LocationCreate):
    id: str

    model_config = {"from_attributes": True}
