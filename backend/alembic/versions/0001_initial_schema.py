"""Initial schema — all JanDrishti AI tables.

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -- Enums (safe: skipped if they already exist) ----
    op.execute("""DO $$ BEGIN CREATE TYPE user_role AS ENUM ('CITIZEN','AUTHORITY','SUPER_ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$""")
    op.execute("""DO $$ BEGIN CREATE TYPE report_status AS ENUM ('REPORTED','UNDER_REVIEW','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','CITIZEN_VERIFICATION','CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$""")
    op.execute("""DO $$ BEGIN CREATE TYPE priority_level AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$""")
    op.execute("""DO $$ BEGIN CREATE TYPE cluster_priority AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$""")
    op.execute("""DO $$ BEGIN CREATE TYPE cluster_status AS ENUM ('REPORTED','UNDER_REVIEW','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','CITIZEN_VERIFICATION','CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$""")
    op.execute("""DO $$ BEGIN CREATE TYPE media_type AS ENUM ('IMAGE','VIDEO','DOCUMENT'); EXCEPTION WHEN duplicate_object THEN null; END $$""")

    # ── users ────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("phone", sa.String(15)),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("CITIZEN","AUTHORITY","SUPER_ADMIN", name="user_role", create_type=False), nullable=False, server_default="CITIZEN"),
        sa.Column("preferred_language", sa.String(10), server_default="en"),
        sa.Column("city", sa.String(100)),
        sa.Column("state", sa.String(100)),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("is_verified", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── categories ───────────────────────────────────────────
    op.create_table(
        "categories",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("name_hi", sa.String(100)),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.String(500)),
        sa.Column("icon", sa.String(10)),
        sa.Column("color", sa.String(20), server_default="#6b7280"),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("sort_order", sa.Integer, server_default="99"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"])

    # ── locations ────────────────────────────────────────────
    op.create_table(
        "locations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("address", sa.String(500)),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("district", sa.String(100)),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("pincode", sa.String(10)),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
    )
    op.create_index("ix_locations_city", "locations", ["city"])
    op.create_index("ix_locations_state", "locations", ["state"])

    # ── problem_clusters ─────────────────────────────────────
    op.create_table(
        "problem_clusters",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("summary", sa.Text),
        sa.Column("category_id", sa.String(36), sa.ForeignKey("categories.id")),
        sa.Column("location_id", sa.String(36), sa.ForeignKey("locations.id")),
        sa.Column("report_count", sa.Integer, server_default="1"),
        sa.Column("total_support", sa.Integer, server_default="0"),
        sa.Column("priority_score", sa.Float, server_default="50"),
        sa.Column("priority_level", sa.Enum("LOW","MEDIUM","HIGH","CRITICAL", name="cluster_priority", create_type=False), server_default="MEDIUM"),
        sa.Column("status", sa.Enum("REPORTED","UNDER_REVIEW","VERIFIED","ASSIGNED","IN_PROGRESS","RESOLVED","CITIZEN_VERIFICATION","CLOSED", name="cluster_status", create_type=False), server_default="REPORTED"),
        sa.Column("representative_report_id", sa.String(36)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── reports ──────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("status", sa.Enum("REPORTED","UNDER_REVIEW","VERIFIED","ASSIGNED","IN_PROGRESS","RESOLVED","CITIZEN_VERIFICATION","CLOSED", name="report_status", create_type=False), nullable=False, server_default="REPORTED"),
        sa.Column("priority_level", sa.Enum("LOW","MEDIUM","HIGH","CRITICAL", name="priority_level", create_type=False), nullable=False, server_default="MEDIUM"),
        sa.Column("priority_score", sa.Float),
        sa.Column("category_id", sa.String(36), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("location_id", sa.String(36), sa.ForeignKey("locations.id")),
        sa.Column("reporter_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("cluster_id", sa.String(36), sa.ForeignKey("problem_clusters.id")),
        sa.Column("support_count", sa.Integer, server_default="0"),
        sa.Column("view_count", sa.Integer, server_default="0"),
        sa.Column("date_observed", sa.DateTime(timezone=True)),
        sa.Column("contact_info", sa.String(200)),
        sa.Column("is_anonymous", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_priority_level", "reports", ["priority_level"])
    op.create_index("ix_reports_category_id", "reports", ["category_id"])
    op.create_index("ix_reports_reporter_id", "reports", ["reporter_id"])
    op.create_index("ix_reports_created_at", "reports", ["created_at"])

    # ── media ────────────────────────────────────────────────
    op.create_table(
        "media",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("thumbnail_url", sa.String(500)),
        sa.Column("media_type", sa.Enum("IMAGE","VIDEO","DOCUMENT", name="media_type", create_type=False), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("size_bytes", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_media_report_id", "media", ["report_id"])

    # ── ai_analyses ──────────────────────────────────────────
    op.create_table(
        "ai_analyses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False, unique=True),
        sa.Column("predicted_category", sa.String(100)),
        sa.Column("category_confidence", sa.Float),
        sa.Column("severity_score", sa.Float, server_default="5"),
        sa.Column("urgency_score", sa.Float, server_default="5"),
        sa.Column("frequency_score", sa.Float, server_default="3"),
        sa.Column("community_impact_score", sa.Float, server_default="5"),
        sa.Column("persistence_score", sa.Float, server_default="3"),
        sa.Column("priority_score", sa.Float, server_default="50"),
        sa.Column("priority_level", sa.String(20), server_default="MEDIUM"),
        sa.Column("reasoning", sa.Text),
        sa.Column("similar_report_ids", sa.Text),
        sa.Column("model_version", sa.String(50), server_default="jd-nlp-v1.0"),
        sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_ai_analyses_report_id", "ai_analyses", ["report_id"])

    # ── status_history ───────────────────────────────────────
    op.create_table(
        "status_history",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("old_status", sa.String(30)),
        sa.Column("new_status", sa.String(30), nullable=False),
        sa.Column("changed_by_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("note", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_status_history_report_id", "status_history", ["report_id"])

    # ── assignments ──────────────────────────────────────────
    op.create_table(
        "assignments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("assigned_to_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("assigned_by_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("department", sa.String(100)),
        sa.Column("due_date", sa.DateTime(timezone=True)),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── comments ─────────────────────────────────────────────
    op.create_table(
        "comments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("author_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("is_internal", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_comments_report_id", "comments", ["report_id"])

    # ── upvotes ──────────────────────────────────────────────
    op.create_table(
        "upvotes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("report_id", "user_id", name="uq_upvote_report_user"),
    )

    # ── notifications ────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("report_id", sa.String(36)),
        sa.Column("is_read", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"])

    # ── audit_logs ───────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50)),
        sa.Column("entity_id", sa.String(36)),
        sa.Column("detail", sa.Text),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    for tbl in [
        "audit_logs", "notifications", "upvotes", "comments",
        "assignments", "status_history", "ai_analyses", "media",
        "reports", "problem_clusters", "locations", "categories", "users",
    ]:
        op.drop_table(tbl)
    for enum in [
        "media_type", "cluster_status", "cluster_priority",
        "priority_level", "report_status", "user_role",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum}")
