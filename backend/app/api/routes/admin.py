"""
Admin-only routes:
  - Audit log viewer
  - AI configuration (read + update)
"""
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.dependencies import get_db, require_super_admin
from app.core.config import settings
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Audit logs ────────────────────────────────────────────────

@router.get("/audit-logs")
def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action.ilike(f"%{action}%"))
    total = q.count()
    items = (
        q.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {
        "items": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "detail": l.detail,
                "ip_address": l.ip_address,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in items
        ],
        "total": total,
        "page": page,
        "total_pages": math.ceil(total / per_page) if per_page else 1,
    }


# ── AI configuration ──────────────────────────────────────────

class AIConfigResponse(BaseModel):
    similarity_threshold: float
    similarity_radius_km: float
    priority_weights: dict


class AIConfigUpdate(BaseModel):
    similarity_threshold: Optional[float] = None
    similarity_radius_km: Optional[float] = None
    priority_weights: Optional[dict] = None


@router.get("/ai-config", response_model=AIConfigResponse)
def get_ai_config(_: User = Depends(require_super_admin)):
    return AIConfigResponse(
        similarity_threshold=settings.SIMILARITY_THRESHOLD,
        similarity_radius_km=settings.SIMILARITY_RADIUS_KM,
        priority_weights={
            "severity": settings.PRIORITY_WEIGHT_SEVERITY,
            "urgency": settings.PRIORITY_WEIGHT_URGENCY,
            "frequency": settings.PRIORITY_WEIGHT_FREQUENCY,
            "community_impact": settings.PRIORITY_WEIGHT_COMMUNITY_IMPACT,
            "persistence": settings.PRIORITY_WEIGHT_PERSISTENCE,
        },
    )


@router.put("/ai-config", response_model=AIConfigResponse)
def update_ai_config(
    data: AIConfigUpdate,
    _: User = Depends(require_super_admin),
):
    """
    Updates in-memory config for the current process lifetime.
    In production, persist these to a settings table in the DB.
    """
    if data.similarity_threshold is not None:
        settings.SIMILARITY_THRESHOLD = data.similarity_threshold
    if data.similarity_radius_km is not None:
        settings.SIMILARITY_RADIUS_KM = data.similarity_radius_km
    if data.priority_weights:
        w = data.priority_weights
        if "severity" in w:
            settings.PRIORITY_WEIGHT_SEVERITY = w["severity"]
        if "urgency" in w:
            settings.PRIORITY_WEIGHT_URGENCY = w["urgency"]
        if "frequency" in w:
            settings.PRIORITY_WEIGHT_FREQUENCY = w["frequency"]
        if "community_impact" in w:
            settings.PRIORITY_WEIGHT_COMMUNITY_IMPACT = w["community_impact"]
        if "persistence" in w:
            settings.PRIORITY_WEIGHT_PERSISTENCE = w["persistence"]
    return get_ai_config(_)
