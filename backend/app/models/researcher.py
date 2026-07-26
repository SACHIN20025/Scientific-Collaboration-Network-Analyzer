from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class ResearcherProfileUpdate(BaseModel):
    department: Optional[str] = None
    institution: Optional[str] = None
    skills: Optional[List[str]] = None
    research_interests: Optional[List[str]] = None
    affiliations: Optional[List[str]] = None
    bio: Optional[str] = None
    orcid: Optional[str] = None


class ResearcherProfile(BaseModel):
    user_id: str
    name: str
    email: str
    department: Optional[str] = None
    institution: Optional[str] = None
    skills: List[str] = []
    research_interests: List[str] = []
    affiliations: List[str] = []
    bio: Optional[str] = None
    orcid: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InstitutionCreate(BaseModel):
    name: str
    address: Optional[str] = None
    website: Optional[str] = None
    departments: List[str] = []


class Institution(InstitutionCreate):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
