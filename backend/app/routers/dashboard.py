from fastapi import APIRouter, Depends

from app.core.database import (
    users_collection,
    researchers_collection,
    publications_collection,
    projects_collection,
    conferences_collection,
    collaborations_collection,
    citations_collection,
)
from app.core.security import get_current_user
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Reports"])


@router.get("/me")
async def my_dashboard(current_user: dict = Depends(get_current_user)):
    researcher = await researchers_collection.find_one({"user_id": current_user["_id"]})
    researcher_id = str(researcher["_id"]) if researcher else None

    publications = await publications_collection.count_documents(
        {"authors": researcher_id}
    ) if researcher_id else 0
    projects = await projects_collection.count_documents(
        {"$or": [{"lead_researcher": researcher_id}, {"team_members": researcher_id}]}
    ) if researcher_id else 0
    conferences = await conferences_collection.count_documents(
        {"participants": researcher_id}
    ) if researcher_id else 0
    collaborations = await collaborations_collection.count_documents(
        {"$or": [{"researcher_a": researcher_id}, {"researcher_b": researcher_id}]}
    ) if researcher_id else 0

    return {
        "publications": publications,
        "projects": projects,
        "conferences": conferences,
        "collaborators": collaborations,
        "profile": serialize_doc(researcher) if researcher else None,
    }


@router.get("/admin")
async def admin_dashboard(current_user: dict = Depends(get_current_user)):
    total_users = await users_collection.count_documents({})
    total_researchers = await researchers_collection.count_documents({})
    total_publications = await publications_collection.count_documents({})
    total_projects = await projects_collection.count_documents({})
    total_conferences = await conferences_collection.count_documents({})
    total_collaborations = await collaborations_collection.count_documents({})
    total_citations = await citations_collection.count_documents({})

    pub_by_status = {}
    async for doc in publications_collection.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ):
        pub_by_status[doc["_id"] or "unknown"] = doc["count"]

    pub_by_type = {}
    async for doc in publications_collection.aggregate(
        [{"$group": {"_id": "$type", "count": {"$sum": 1}}}]
    ):
        pub_by_type[doc["_id"] or "unknown"] = doc["count"]

    projects_by_status = {}
    async for doc in projects_collection.aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ):
        projects_by_status[doc["_id"] or "unknown"] = doc["count"]

    return {
        "totals": {
            "users": total_users,
            "researchers": total_researchers,
            "publications": total_publications,
            "projects": total_projects,
            "conferences": total_conferences,
            "collaborations": total_collaborations,
            "citations": total_citations,
        },
        "publications_by_status": pub_by_status,
        "publications_by_type": pub_by_type,
        "projects_by_status": projects_by_status,
    }


@router.get("/institution/{institution_name}")
async def institution_dashboard(institution_name: str, current_user: dict = Depends(get_current_user)):
    researcher_count = await researchers_collection.count_documents(
        {"institution": institution_name}
    )
    publication_count = await publications_collection.count_documents(
        {"institution": institution_name}
    )
    project_count = await projects_collection.count_documents(
        {"institutions": institution_name}
    )
    departments = await researchers_collection.distinct(
        "department", {"institution": institution_name}
    )

    return {
        "institution": institution_name,
        "researchers": researcher_count,
        "publications": publication_count,
        "projects": project_count,
        "departments": [d for d in departments if d],
    }
