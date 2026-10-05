"""
Import all models here so SQLAlchemy/Alembic can discover them.
Order matters — define tables before FK references where possible.
"""
from app.models.user import User
from app.models.category import Category
from app.models.location import Location
from app.models.problem_cluster import ProblemCluster
from app.models.report import Report
from app.models.media import Media
from app.models.ai_analysis import AIAnalysis
from app.models.status_history import StatusHistory
from app.models.assignment import Assignment
from app.models.comment import Comment
from app.models.upvote import Upvote
from app.models.notification import Notification
from app.models.audit_log import AuditLog

__all__ = [
    "User", "Category", "Location", "ProblemCluster", "Report",
    "Media", "AIAnalysis", "StatusHistory", "Assignment", "Comment",
    "Upvote", "Notification", "AuditLog",
]
