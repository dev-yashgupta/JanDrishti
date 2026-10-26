"""Report (civic problem submission) model."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Text, Boolean, DateTime, Float, Integer,
    ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[str] = mapped_column(
        SAEnum(
            "REPORTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED",
            "IN_PROGRESS", "RESOLVED", "CITIZEN_VERIFICATION", "CLOSED",
            name="report_status",
        ),
        default="REPORTED",
        nullable=False,
        index=True,
    )
    priority_level: Mapped[str] = mapped_column(
        SAEnum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="priority_level"),
        default="MEDIUM",
        nullable=False,
        index=True,
    )
    priority_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # FKs
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("categories.id"), nullable=False, index=True
    )
    location_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("locations.id"), nullable=True
    )
    reporter_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    cluster_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("problem_clusters.id"), nullable=True
    )

    support_count: Mapped[int] = mapped_column(Integer, default=0)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    date_observed: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    contact_info: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # relationships
    category = relationship("Category", back_populates="reports")
    location = relationship("Location", back_populates="reports")
    reporter = relationship("User", back_populates="reports", foreign_keys=[reporter_id])
    cluster = relationship("ProblemCluster", back_populates="reports", foreign_keys=[cluster_id])
    media = relationship("Media", back_populates="report", cascade="all, delete-orphan")
    ai_analysis = relationship(
        "AIAnalysis", back_populates="report",
        uselist=False, cascade="all, delete-orphan"
    )
    status_history = relationship(
        "StatusHistory", back_populates="report",
        order_by="StatusHistory.created_at", cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", back_populates="report",
        order_by="Comment.created_at", cascade="all, delete-orphan"
    )
    upvotes = relationship("Upvote", back_populates="report", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="report", cascade="all, delete-orphan")
