from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends

from app.core.database import citations_collection
from app.core.security import get_current_user
from app.models.conference import CitationCreate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/citations", tags=["Citations"])


@router.get("")
async def list_citations(current_user: dict = Depends(get_current_user)):
    cursor = citations_collection.find({}).sort("created_at", -1)
    return [serialize_doc(doc) async for doc in cursor]


@router.get("/publication/{publication_id}")
async def get_citations_for_publication(
    publication_id: str, current_user: dict = Depends(get_current_user)
):
    cursor = citations_collection.find(
        {
            "$or": [
                {"citing_publication_id": publication_id},
                {"cited_publication_id": publication_id},
            ]
        }
    )
    return [serialize_doc(doc) async for doc in cursor]


@router.post("", status_code=201)
async def create_citation(payload: CitationCreate, current_user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["created_by"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)
    result = await citations_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.delete("/{citation_id}", status_code=204)
async def delete_citation(citation_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(citation_id):
        raise HTTPException(status_code=400, detail="Invalid citation id")
    result = await citations_collection.delete_one({"_id": ObjectId(citation_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Citation not found")
    return None
