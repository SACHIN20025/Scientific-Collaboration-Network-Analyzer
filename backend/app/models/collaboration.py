from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    PLANNED = "planned"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    funding_source: Optional[str] = None
    budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNED
    lead_researcher: Optional[str] = None
    team_members: List[str] = []
    institutions: List[str] = []


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    funding_source: Optional[str] = None
    budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[ProjectStatus] = None
    lead_researcher: Optional[str] = None
    team_members: Optional[List[str]] = None
    institutions: Optional[List[str]] = None


class Project(ProjectCreate):
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CollaborationCreate(BaseModel):
    researcher_a: str
    researcher_b: str
    project_id: Optional[str] = None
    publication_id: Optional[str] = None
    institution_a: Optional[str] = None
    institution_b: Optional[str] = None
    collaboration_type: str = "co-authorship"
    notes: Optional[str] = None


class Collaboration(CollaborationCreate):
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
