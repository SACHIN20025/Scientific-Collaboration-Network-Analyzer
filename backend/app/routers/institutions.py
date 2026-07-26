from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends

from app.core.database import institutions_collection
from app.core.security import get_current_user
from app.models.researcher import InstitutionCreate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/institutions", tags=["Institutions"])


@router.get("")
async def list_institutions(current_user: dict = Depends(get_current_user)):
    cursor = institutions_collection.find({}).sort("name", 1)
    return [serialize_doc(doc) async for doc in cursor]


@router.post("", status_code=201)
async def create_institution(
    payload: InstitutionCreate, current_user: dict = Depends(get_current_user)
):
    existing = await institutions_collection.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Institution already exists")
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    result = await institutions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.delete("/{institution_id}", status_code=204)
async def delete_institution(institution_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(institution_id):
        raise HTTPException(status_code=400, detail="Invalid institution id")
    result = await institutions_collection.delete_one({"_id": ObjectId(institution_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Institution not found")
    return None
