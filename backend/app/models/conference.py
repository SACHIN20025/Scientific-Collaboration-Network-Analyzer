from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class ConferenceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    website: Optional[str] = None
    participants: List[str] = []  # researcher ids
    presentations: List[str] = []  # publication ids or titles


class ConferenceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    website: Optional[str] = None
    participants: Optional[List[str]] = None
    presentations: Optional[List[str]] = None


class Conference(ConferenceCreate):
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CitationCreate(BaseModel):
    citing_publication_id: str
    cited_publication_id: Optional[str] = None
    cited_reference_text: Optional[str] = None
    doi: Optional[str] = None


class Citation(CitationCreate):
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
