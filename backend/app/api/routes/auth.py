"""Authentication routes — register, login, me, logout."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_active_user
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, Token, AuthResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import get_user_by_email, create_user
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    user = create_user(db, data)
    token = create_access_token(subject=user.id, role=user.role)
    return AuthResponse(
        user=UserResponse.model_validate(user),
        tokens=Token(access_token=token),
    )


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Audit log
    log = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="LOGIN",
        ip_address=request.client.host if request.client else None,
    )
    db.add(log)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return AuthResponse(
        user=UserResponse.model_validate(user),
        tokens=Token(access_token=token),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_active_user)):
    # JWT is stateless — client discards token; log the action
    return None
