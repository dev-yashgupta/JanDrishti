"""Problem cluster routes."""
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_db, get_optional_user
from app.models.user import User
from app.models.problem_cluster import ProblemCluster
from app.models.report import Report
from app.schemas.cluster import ClusterResponse, PaginatedClusters
from app.schemas.report import ReportResponse

router = APIRouter(prefix="/clusters", tags=["clusters"])


@router.get("", response_model=PaginatedClusters)
def list_clusters(
    priority_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(ProblemCluster).options(
        joinedload(ProblemCluster.category),
        joinedload(ProblemCluster.location),
    )
    if priority_level:
        q = q.filter(ProblemCluster.priority_level == priority_level.upper())
    if status:
        q = q.filter(ProblemCluster.status == status.upper())
    if category_id:
        q = q.filter(ProblemCluster.category_id == category_id)

    total = q.count()
    items = (
        q.order_by(ProblemCluster.priority_score.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return PaginatedClusters(
        items=[ClusterResponse.model_validate(c) for c in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if per_page else 1,
    )


@router.get("/{cluster_id}", response_model=ClusterResponse)
def get_cluster(cluster_id: str, db: Session = Depends(get_db)):
    cluster = (
        db.query(ProblemCluster)
        .options(
            joinedload(ProblemCluster.category),
            joinedload(ProblemCluster.location),
        )
        .filter(ProblemCluster.id == cluster_id)
        .first()
    )
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return ClusterResponse.model_validate(cluster)


@router.get("/{cluster_id}/reports")
def cluster_reports(cluster_id: str, db: Session = Depends(get_db)):
    reports = (
        db.query(Report)
        .options(
            joinedload(Report.category),
            joinedload(Report.location),
            joinedload(Report.ai_analysis),
        )
        .filter(Report.cluster_id == cluster_id)
        .order_by(Report.priority_score.desc().nullslast())
        .all()
    )
    return [ReportResponse.model_validate(r) for r in reports]
