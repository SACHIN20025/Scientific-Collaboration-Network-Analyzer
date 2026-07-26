from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import ensure_indexes
from app.routers import (
    auth,
    researchers,
    publications,
    projects,
    collaborations,
    conferences,
    citations,
    dashboard,
    institutions,
    audit,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    yield


app = FastAPI(
    title="Scientific Collaboration Network Analyzer API",
    description="Research collaboration management platform API (FastAPI + MongoDB)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(researchers.router)
app.include_router(publications.router)
app.include_router(projects.router)
app.include_router(collaborations.router)
app.include_router(conferences.router)
app.include_router(citations.router)
app.include_router(dashboard.router)
app.include_router(institutions.router)
app.include_router(audit.router)


@app.get("/")
async def root():
    return {
        "message": "Scientific Collaboration Network Analyzer API",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
