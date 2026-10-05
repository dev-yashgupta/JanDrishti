"""Problem Cluster — groups of similar nearby reports."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class ProblemCluster(Base):
    __tablename__ = "problem_clusters"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    category_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("categories.id"), nullable=True, index=True
    )
    location_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("locations.id"), nullable=True
    )

    report_count: Mapped[int] = mapped_column(Integer, default=1)
    total_support: Mapped[int] = mapped_column(Integer, default=0)
    priority_score: Mapped[float] = mapped_column(Float, default=50.0)
    priority_level: Mapped[str] = mapped_column(
        SAEnum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="cluster_priority"),
        default="MEDIUM",
    )
    status: Mapped[str] = mapped_column(
        SAEnum(
            "REPORTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED",
            "IN_PROGRESS", "RESOLVED", "CITIZEN_VERIFICATION", "CLOSED",
            name="cluster_status",
        ),
        default="REPORTED",
    )
    representative_report_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # relationships
    category = relationship("Category", back_populates="clusters")
    location = relationship("Location", back_populates="clusters")
    reports = relationship(
        "Report", back_populates="cluster",
        foreign_keys="Report.cluster_id"
    )
