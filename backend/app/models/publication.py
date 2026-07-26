from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class PublicationType(str, Enum):
    JOURNAL = "journal_paper"
    CONFERENCE = "conference_paper"
    BOOK = "book"
    PATENT = "patent"
    TECHNICAL_REPORT = "technical_report"
    OTHER = "other"


class PublicationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class PublicationCreate(BaseModel):
    title: str
    abstract: Optional[str] = None
    type: PublicationType = PublicationType.JOURNAL
    status: PublicationStatus = PublicationStatus.DRAFT
    authors: List[str] = []  # researcher ids
    co_author_names: List[str] = []  # free text names not in system
    journal_or_venue: Optional[str] = None
    publication_date: Optional[str] = None
    doi: Optional[str] = None
    keywords: List[str] = []
    file_url: Optional[str] = None
    institution: Optional[str] = None
    project_id: Optional[str] = None


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    type: Optional[PublicationType] = None
    status: Optional[PublicationStatus] = None
    authors: Optional[List[str]] = None
    co_author_names: Optional[List[str]] = None
    journal_or_venue: Optional[str] = None
    publication_date: Optional[str] = None
    doi: Optional[str] = None
    keywords: Optional[List[str]] = None
    file_url: Optional[str] = None
    project_id: Optional[str] = None


class Publication(PublicationCreate):
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
