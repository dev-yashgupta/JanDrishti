"""API package — registers all routers on the main FastAPI app."""
from fastapi import FastAPI
from app.api.routes import auth, categories, reports, dashboard, clusters, notifications, users, media, admin


def register_routers(app: FastAPI) -> None:
    prefix = "/api"
    app.include_router(auth.router, prefix=prefix)
    app.include_router(categories.router, prefix=prefix)
    app.include_router(reports.router, prefix=prefix)
    app.include_router(dashboard.router, prefix=prefix)
    app.include_router(clusters.router, prefix=prefix)
    app.include_router(notifications.router, prefix=prefix)
    app.include_router(users.router, prefix=prefix)
    app.include_router(media.router, prefix=prefix)
    app.include_router(admin.router, prefix=prefix)
