"""
Reports routes — full CRUD + status workflow + AI analysis + clustering.
"""
import json
import uuid
import math
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import (
    get_db, get_current_active_user, get_optional_user,
    require_authority, PaginationParams,
)
from app.models.user import User
from app.models.report import Report
from app.models.location import Location
from app.models.ai_analysis import AIAnalysis
from app.models.status_history import StatusHistory
from app.models.comment import Comment
from app.models.upvote import Upvote
from app.models.notification import Notification
from app.models.problem_cluster import ProblemCluster
from app.models.assignment import Assignment
from app.schemas.report import (
    ReportCreate, ReportUpdate, ReportResponse, PaginatedReports,
    StatusChangeRequest, AssignRequest, CommentCreate, CommentResponse,
    StatusHistoryResponse,
)
from app.ai.ai_service import ai_service, _ExistingReport
from app.ai.similarity.tfidf_engine import haversine_km
from app.core.config import settings

router = APIRouter(prefix="/reports", tags=["reports"])


# ── helpers ───────────────────────────────────────────────────

def _load_report(db: Session, report_id: str) -> Report:
    report = (
        db.query(Report)
        .options(
            joinedload(Report.category),
            joinedload(Report.location),
            joinedload(Report.reporter),
            joinedload(Report.media),
            joinedload(Report.ai_analysis),
        )
        .filter(Report.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


def _notify(db: Session, user_id: str, notif_type: str, title: str, message: str, report_id: str):
    n = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type=notif_type,
        title=title,
        message=message,
        report_id=report_id,
    )
    db.add(n)


def _run_ai_and_store(db: Session, report: Report) -> None:
    """Run AI pipeline and persist result to ai_analyses table."""
    # Gather existing reports for similarity
    existing = db.query(Report).filter(Report.id != report.id).all()
    existing_dtos = [
        _ExistingReport(
            id=r.id,
            text=f"{r.title} {r.description}",
            latitude=r.location.latitude if r.location else None,
            longitude=r.location.longitude if r.location else None,
        )
        for r in existing
    ]

    result = ai_service.analyze_report(
        title=report.title,
        description=report.description,
        latitude=report.location.latitude if report.location else None,
        longitude=report.location.longitude if report.location else None,
        existing_reports=existing_dtos,
    )

    similar_ids = json.dumps([s.report_id for s in result.similar_reports])

    analysis = AIAnalysis(
        id=str(uuid.uuid4()),
        report_id=report.id,
        predicted_category=result.predicted_category_name,
        category_confidence=result.category_confidence,
        severity_score=result.severity_score,
        urgency_score=result.urgency_score,
        frequency_score=result.frequency_score,
        community_impact_score=result.community_impact_score,
        persistence_score=result.persistence_score,
        priority_score=result.priority_score,
        priority_level=result.priority_level,
        reasoning=result.reasoning,
        similar_report_ids=similar_ids,
        model_version=result.model_version,
    )
    db.add(analysis)

    # Update report priority
    report.priority_level = result.priority_level
    report.priority_score = result.priority_score

    # Cluster detection — if similar reports found, group into cluster
    if result.similar_reports:
        _handle_clustering(db, report, result.similar_reports)

    db.commit()


def _handle_clustering(db: Session, report: Report, similar_reports):
    """Find or create a problem cluster for this report."""
    # Check if any similar report already belongs to a cluster
    similar_ids = [s.report_id for s in similar_reports]
    existing_cluster_report = (
        db.query(Report)
        .filter(Report.id.in_(similar_ids), Report.cluster_id != None)
        .first()
    )

    if existing_cluster_report and existing_cluster_report.cluster_id:
        cluster = db.query(ProblemCluster).filter(
            ProblemCluster.id == existing_cluster_report.cluster_id
        ).first()
        if cluster:
            report.cluster_id = cluster.id
            cluster.report_count += 1
            cluster.total_support += report.support_count
            return

    # Create new cluster
    cluster = ProblemCluster(
        id=str(uuid.uuid4()),
        title=report.title,
        summary=(
            f"Multiple reports about: {report.title}. "
            f"Location: {report.location.city if report.location else 'unknown'}. "
            f"This cluster groups {len(similar_reports)+1} similar reports in the area."
        ),
        category_id=report.category_id,
        location_id=report.location_id,
        report_count=len(similar_ids) + 1,
        total_support=report.support_count,
        priority_score=report.priority_score or 50,
        priority_level=report.priority_level,
        status=report.status,
        representative_report_id=report.id,
    )
    db.add(cluster)
    db.flush()  # get the cluster ID

    report.cluster_id = cluster.id
    # Attach similar reports to same cluster
    for sim in similar_reports:
        sim_report = db.query(Report).filter(Report.id == sim.report_id).first()
        if sim_report:
            sim_report.cluster_id = cluster.id


# ── CREATE ────────────────────────────────────────────────────

@router.post("", response_model=ReportResponse, status_code=201)
def create_report(
    data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Create location
    loc = Location(
        id=str(uuid.uuid4()),
        address=data.address,
        city=data.city,
        state=data.state,
        latitude=data.latitude or 0.0,
        longitude=data.longitude or 0.0,
    )
    db.add(loc)
    db.flush()

    report = Report(
        id=str(uuid.uuid4()),
        title=data.title,
        description=data.description,
        category_id=data.category_id,
        location_id=loc.id,
        reporter_id=current_user.id,
        date_observed=data.date_observed,
        contact_info=data.contact_info,
        is_anonymous=data.is_anonymous,
        status="REPORTED",
        priority_level="MEDIUM",
    )
    db.add(report)
    db.flush()

    # Initial status history
    sh = StatusHistory(
        id=str(uuid.uuid4()),
        report_id=report.id,
        old_status=None,
        new_status="REPORTED",
        changed_by_id=current_user.id,
        note="Report submitted by citizen",
    )
    db.add(sh)
    db.commit()
    db.refresh(report)

    # Run AI asynchronously (in production use a background task / queue)
    try:
        _run_ai_and_store(db, report)
        db.refresh(report)
    except Exception:
        pass  # AI failure should never block the submission

    return _load_report(db, report.id)


# ── LIST ──────────────────────────────────────────────────────

@router.get("", response_model=PaginatedReports)
def list_reports(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority_level: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    sort_by: str = Query("priority", pattern="^(priority|newest|oldest|most_reported)$"),
    my: bool = Query(False),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    q = (
        db.query(Report)
        .options(
            joinedload(Report.category),
            joinedload(Report.location),
            joinedload(Report.reporter),
            joinedload(Report.ai_analysis),
        )
    )

    if my and current_user:
        q = q.filter(Report.reporter_id == current_user.id)
    if search:
        like = f"%{search}%"
        q = q.filter(
            Report.title.ilike(like) | Report.description.ilike(like)
        )
    if category_id:
        q = q.filter(Report.category_id == category_id)
    if status:
        q = q.filter(Report.status == status.upper())
    if priority_level:
        q = q.filter(Report.priority_level == priority_level.upper())
    if city:
        q = q.join(Location, Report.location_id == Location.id).filter(Location.city.ilike(f"%{city}%"))
    if state:
        q = q.join(Location, Report.location_id == Location.id).filter(Location.state.ilike(f"%{state}%"))

    total = q.count()

    if sort_by == "priority":
        q = q.order_by(Report.priority_score.desc().nullslast())
    elif sort_by == "newest":
        q = q.order_by(Report.created_at.desc())
    elif sort_by == "oldest":
        q = q.order_by(Report.created_at.asc())
    elif sort_by == "most_reported":
        q = q.order_by(Report.support_count.desc())

    items = q.offset((page - 1) * per_page).limit(per_page).all()
    total_pages = math.ceil(total / per_page) if per_page else 1

    return PaginatedReports(
        items=[ReportResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


# ── GET ONE ───────────────────────────────────────────────────

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    _: Optional[User] = Depends(get_optional_user),
):
    report = _load_report(db, report_id)
    report.view_count += 1
    db.commit()
    return ReportResponse.model_validate(report)


# ── UPDATE ────────────────────────────────────────────────────

@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: str,
    data: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.reporter_id != current_user.id and current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorised")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(report, k, v)
    db.commit()
    return _load_report(db, report_id)


# ── DELETE ────────────────────────────────────────────────────

@router.delete("/{report_id}", status_code=204)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.reporter_id != current_user.id and current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorised")
    db.delete(report)
    db.commit()


# ── STATUS CHANGE ─────────────────────────────────────────────

@router.patch("/{report_id}/status", response_model=ReportResponse)
def change_status(
    report_id: str,
    data: StatusChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authority),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    old_status = report.status
    report.status = data.new_status
    report.updated_at = datetime.now(timezone.utc)

    sh = StatusHistory(
        id=str(uuid.uuid4()),
        report_id=report.id,
        old_status=old_status,
        new_status=data.new_status,
        changed_by_id=current_user.id,
        note=data.note,
    )
    db.add(sh)

    # Notify reporter
    if not report.is_anonymous:
        _notify(
            db, report.reporter_id,
            "STATUS_CHANGED",
            "Your report status was updated",
            f'Your report "{report.title}" is now {data.new_status.replace("_", " ").title()}.',
            report.id,
        )

    db.commit()
    return _load_report(db, report_id)


# ── ASSIGN ────────────────────────────────────────────────────

@router.post("/{report_id}/assign", response_model=ReportResponse)
def assign_report(
    report_id: str,
    data: AssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authority),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    assignment = Assignment(
        id=str(uuid.uuid4()),
        report_id=report.id,
        assigned_to_id=data.assigned_to_id,
        assigned_by_id=current_user.id,
        department=data.department,
        due_date=data.due_date,
        notes=data.notes,
    )
    db.add(assignment)

    if report.status == "VERIFIED":
        report.status = "ASSIGNED"
        sh = StatusHistory(
            id=str(uuid.uuid4()),
            report_id=report.id,
            old_status="VERIFIED",
            new_status="ASSIGNED",
            changed_by_id=current_user.id,
            note=f"Assigned to department: {data.department or 'unknown'}",
        )
        db.add(sh)

    db.commit()
    return _load_report(db, report_id)


# ── SUPPORT / UPVOTE ──────────────────────────────────────────

@router.post("/{report_id}/support")
def toggle_support(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    existing = db.query(Upvote).filter(
        Upvote.report_id == report_id,
        Upvote.user_id == current_user.id,
    ).first()

    if existing:
        db.delete(existing)
        report.support_count = max(0, report.support_count - 1)
        supported = False
    else:
        upvote = Upvote(id=str(uuid.uuid4()), report_id=report_id, user_id=current_user.id)
        db.add(upvote)
        report.support_count += 1
        supported = True

    db.commit()
    return {"support_count": report.support_count, "supported": supported}


# ── COMMENTS ──────────────────────────────────────────────────

@router.post("/{report_id}/comments", response_model=CommentResponse, status_code=201)
def add_comment(
    report_id: str,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if data.is_internal and current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Only authority can add internal notes")

    comment = Comment(
        id=str(uuid.uuid4()),
        report_id=report_id,
        author_id=current_user.id,
        content=data.content,
        is_internal=data.is_internal,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentResponse.model_validate(comment)


@router.get("/{report_id}/comments", response_model=List[CommentResponse])
def get_comments(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    q = db.query(Comment).filter(Comment.report_id == report_id)
    if not current_user or current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        q = q.filter(Comment.is_internal == False)
    return q.order_by(Comment.created_at).all()


# ── STATUS HISTORY ────────────────────────────────────────────

@router.get("/{report_id}/history", response_model=List[StatusHistoryResponse])
def get_history(report_id: str, db: Session = Depends(get_db)):
    return (
        db.query(StatusHistory)
        .filter(StatusHistory.report_id == report_id)
        .order_by(StatusHistory.created_at)
        .all()
    )


# ── NEARBY PROBLEMS ───────────────────────────────────────────

@router.get("/nearby/search")
def nearby_problems(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(5.0),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .options(joinedload(Report.location), joinedload(Report.category))
        .join(Location, Report.location_id == Location.id)
        .all()
    )
    nearby = []
    for r in reports:
        if r.location:
            dist = haversine_km(lat, lng, r.location.latitude, r.location.longitude)
            if dist <= radius:
                nearby.append({"report": ReportResponse.model_validate(r), "distance_km": round(dist, 2)})
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby[:20]
