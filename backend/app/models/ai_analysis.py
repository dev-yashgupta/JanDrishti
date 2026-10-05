"""AI Analysis result model — one per report."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id"), nullable=False, unique=True, index=True
    )

    # Classification
    predicted_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Scores (1–10)
    severity_score: Mapped[float] = mapped_column(Float, default=5.0)
    urgency_score: Mapped[float] = mapped_column(Float, default=5.0)
    frequency_score: Mapped[float] = mapped_column(Float, default=3.0)
    community_impact_score: Mapped[float] = mapped_column(Float, default=5.0)
    persistence_score: Mapped[float] = mapped_column(Float, default=3.0)

    # Priority (0–100)
    priority_score: Mapped[float] = mapped_column(Float, default=50.0)
    priority_level: Mapped[str] = mapped_column(String(20), default="MEDIUM")

    # Explainability
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    similar_report_ids: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list

    # Meta
    model_version: Mapped[str] = mapped_column(String(50), default="jd-nlp-v1.0")
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # relationships
    report = relationship("Report", back_populates="ai_analysis")
