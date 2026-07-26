from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query

from app.core.database import researchers_collection
from app.core.security import get_current_user
from app.models.researcher import ResearcherProfileUpdate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/researchers", tags=["Researchers"])


@router.get("")
async def list_researchers(
    search: str | None = Query(default=None),
    department: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"skills": {"$regex": search, "$options": "i"}},
            {"research_interests": {"$regex": search, "$options": "i"}},
        ]
    if department:
        query["department"] = department

    cursor = researchers_collection.find(query).sort("name", 1)
    researchers = [serialize_doc(doc) async for doc in cursor]
    return researchers


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    profile = await researchers_collection.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Researcher profile not found")
    return serialize_doc(profile)


@router.get("/{researcher_id}")
async def get_researcher(researcher_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(researcher_id):
        raise HTTPException(status_code=400, detail="Invalid researcher id")
    profile = await researchers_collection.find_one({"_id": ObjectId(researcher_id)})
    if not profile:
        raise HTTPException(status_code=404, detail="Researcher not found")
    return serialize_doc(profile)


@router.put("/me")
async def update_my_profile(
    payload: ResearcherProfileUpdate, current_user: dict = Depends(get_current_user)
):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await researchers_collection.find_one_and_update(
        {"user_id": current_user["_id"]},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Researcher profile not found")
    return serialize_doc(result)
