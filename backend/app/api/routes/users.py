"""User management routes (authority + super admin)."""
import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.dependencies import get_db, require_authority, require_super_admin, get_current_active_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import (
    get_user_by_id, list_users, update_user, deactivate_user, activate_user
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_all_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_authority),
):
    items, total = list_users(db, search=search, role=role, page=page, per_page=per_page)
    return {
        "items": [UserResponse.model_validate(u) for u in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": math.ceil(total / per_page) if per_page else 1,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_current_user_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return UserResponse.model_validate(update_user(db, current_user, data))


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    target_id = current_user.id if user_id in ("me", "@me") else user_id
    if current_user.id != target_id and current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorised")
    user = get_user_by_id(db, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user_endpoint(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    target_id = current_user.id if user_id in ("me", "@me") else user_id
    # Users can update themselves; admins can update anyone
    if current_user.id != target_id and current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorised")
    user = get_user_by_id(db, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(update_user(db, user, data))


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
def deactivate(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Cannot deactivate super admin")
    return UserResponse.model_validate(deactivate_user(db, user))


@router.patch("/{user_id}/activate", response_model=UserResponse)
def activate(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(activate_user(db, user))
