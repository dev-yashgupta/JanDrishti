"""User Pydantic schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_language: str = "en"
    city: Optional[str] = None
    state: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str = "CITIZEN"

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"CITIZEN", "AUTHORITY", "SUPER_ADMIN"}
        if v.upper() not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v.upper()


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

    @field_validator("phone", "city", "state", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v


class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    """Safe public view — no sensitive fields."""
    id: str
    full_name: str
    role: str
    city: Optional[str] = None
    state: Optional[str] = None

    model_config = {"from_attributes": True}
