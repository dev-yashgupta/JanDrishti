"""User CRUD service."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password
import uuid


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        id=str(uuid.uuid4()),
        full_name=data.full_name,
        email=data.email.lower(),
        phone=data.phone,
        hashed_password=hash_password(data.password),
        role=data.role.upper(),
        preferred_language=data.preferred_language or "en",
        city=data.city,
        state=data.state,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def list_users(
    db: Session,
    search: Optional[str] = None,
    role: Optional[str] = None,
    page: int = 1,
    per_page: int = 10,
) -> tuple[list[User], int]:
    q = db.query(User)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (User.full_name.ilike(like)) | (User.email.ilike(like)) | (User.city.ilike(like))
        )
    if role:
        q = q.filter(User.role == role.upper())
    total = q.count()
    items = q.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return items, total


def deactivate_user(db: Session, user: User) -> User:
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user: User) -> User:
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
