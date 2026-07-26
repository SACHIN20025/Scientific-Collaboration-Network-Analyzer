from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query

from app.core.database import publications_collection
from app.core.security import get_current_user
from app.models.publication import PublicationCreate, PublicationUpdate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/publications", tags=["Publications"])


@router.get("")
async def list_publications(
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    type_filter: str | None = Query(default=None, alias="type"),
    author: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"keywords": {"$regex": search, "$options": "i"}},
            {"journal_or_venue": {"$regex": search, "$options": "i"}},
        ]
    if status_filter:
        query["status"] = status_filter
    if type_filter:
        query["type"] = type_filter
    if author:
        query["authors"] = author

    cursor = publications_collection.find(query).sort("created_at", -1)
    pubs = [serialize_doc(doc) async for doc in cursor]
    return pubs


@router.get("/{publication_id}")
async def get_publication(publication_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(publication_id):
        raise HTTPException(status_code=400, detail="Invalid publication id")
    doc = await publications_collection.find_one({"_id": ObjectId(publication_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Publication not found")
    return serialize_doc(doc)


@router.post("", status_code=201)
async def create_publication(
    payload: PublicationCreate, current_user: dict = Depends(get_current_user)
):
    doc = payload.model_dump()
    doc["created_by"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    result = await publications_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{publication_id}")
async def update_publication(
    publication_id: str,
    payload: PublicationUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(publication_id):
        raise HTTPException(status_code=400, detail="Invalid publication id")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await publications_collection.find_one_and_update(
        {"_id": ObjectId(publication_id)}, {"$set": update_data}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Publication not found")
    return serialize_doc(result)


@router.delete("/{publication_id}", status_code=204)
async def delete_publication(
    publication_id: str, current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(publication_id):
        raise HTTPException(status_code=400, detail="Invalid publication id")
    result = await publications_collection.delete_one({"_id": ObjectId(publication_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Publication not found")
    return None
