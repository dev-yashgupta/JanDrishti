"""Category schemas."""
from typing import Optional
from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    name_hi: Optional[str] = None
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#6b7280"
    is_active: bool = True
    sort_order: int = 99


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_hi: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: str

    model_config = {"from_attributes": True}
