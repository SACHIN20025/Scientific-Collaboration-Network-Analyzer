from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query

from app.core.database import projects_collection
from app.core.security import get_current_user
from app.models.collaboration import ProjectCreate, ProjectUpdate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("")
async def list_projects(
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if status_filter:
        query["status"] = status_filter
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    cursor = projects_collection.find(query).sort("created_at", -1)
    return [serialize_doc(doc) async for doc in cursor]


@router.get("/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_doc(doc)


@router.post("", status_code=201)
async def create_project(payload: ProjectCreate, current_user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["created_by"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    result = await projects_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{project_id}")
async def update_project(
    project_id: str, payload: ProjectUpdate, current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await projects_collection.find_one_and_update(
        {"_id": ObjectId(project_id)}, {"$set": update_data}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_doc(result)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    result = await projects_collection.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
