"""
FastAPI dependency functions — current user, role guards, pagination.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def _get_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    payload: dict = Depends(_get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    user_id: str = payload.get("sub", "")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")
    return current_user


def require_authority(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authority access required")
    return current_user


def require_super_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    return current_user


# Optional auth — returns None if no token supplied
def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub", "")
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except JWTError:
        return None


# ── Pagination ────────────────────────────────────────────────

class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number (1-indexed)"),
        per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.per_page = per_page

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page
