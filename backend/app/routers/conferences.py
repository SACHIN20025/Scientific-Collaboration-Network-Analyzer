from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query

from app.core.database import conferences_collection
from app.core.security import get_current_user
from app.models.conference import ConferenceCreate, ConferenceUpdate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/conferences", tags=["Conferences"])


@router.get("")
async def list_conferences(
    search: str | None = Query(default=None), current_user: dict = Depends(get_current_user)
):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    cursor = conferences_collection.find(query).sort("start_date", -1)
    return [serialize_doc(doc) async for doc in cursor]


@router.get("/{conference_id}")
async def get_conference(conference_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(conference_id):
        raise HTTPException(status_code=400, detail="Invalid conference id")
    doc = await conferences_collection.find_one({"_id": ObjectId(conference_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Conference not found")
    return serialize_doc(doc)


@router.post("", status_code=201)
async def create_conference(
    payload: ConferenceCreate, current_user: dict = Depends(get_current_user)
):
    doc = payload.model_dump()
    doc["created_by"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)
    result = await conferences_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{conference_id}")
async def update_conference(
    conference_id: str,
    payload: ConferenceUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(conference_id):
        raise HTTPException(status_code=400, detail="Invalid conference id")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    result = await conferences_collection.find_one_and_update(
        {"_id": ObjectId(conference_id)}, {"$set": update_data}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Conference not found")
    return serialize_doc(result)


@router.delete("/{conference_id}", status_code=204)
async def delete_conference(conference_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(conference_id):
        raise HTTPException(status_code=400, detail="Invalid conference id")
    result = await conferences_collection.delete_one({"_id": ObjectId(conference_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conference not found")
    return None
