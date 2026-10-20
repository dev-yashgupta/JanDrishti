"""
Media upload route.
Stores files locally to the uploads/ directory.
Storage layer is abstracted behind save_file() so S3/Cloudinary can be
added later by replacing that function.
"""
import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_active_user
from app.core.config import settings
from app.models.user import User
from app.models.media import Media
from app.models.report import Report
from app.schemas.common import MediaUploadResponse

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_TYPES = {
    "image/jpeg": "IMAGE",
    "image/jpg": "IMAGE",
    "image/png": "IMAGE",
    "image/webp": "IMAGE",
    "video/mp4": "VIDEO",
}
MAX_IMAGE_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
MAX_VIDEO_BYTES = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024


def _safe_filename(original: str) -> str:
    ext = Path(original).suffix.lower()
    return f"{uuid.uuid4().hex}{ext}"


async def save_file(content: bytes, filename: str) -> str:
    """Save file to local uploads dir. Returns public URL path."""
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / filename
    async with aiofiles.open(str(dest), "wb") as f:
        await f.write(content)
    return f"/uploads/{filename}"


@router.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    report_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.reporter_id != current_user.id and current_user.role not in ("AUTHORITY", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorised")

    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {content_type}. Allowed: JPEG, PNG, WEBP, MP4",
        )

    content = await file.read()
    max_size = MAX_VIDEO_BYTES if ALLOWED_TYPES[content_type] == "VIDEO" else MAX_IMAGE_BYTES
    if len(content) > max_size:
        raise HTTPException(status_code=413, detail="File too large")

    safe_name = _safe_filename(file.filename or "upload")
    url = await save_file(content, safe_name)

    media = Media(
        id=str(uuid.uuid4()),
        report_id=report_id,
        url=url,
        media_type=ALLOWED_TYPES[content_type],
        filename=safe_name,
        size_bytes=len(content),
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    return MediaUploadResponse(
        id=media.id,
        url=media.url,
        media_type=media.media_type,
        filename=media.filename,
    )
