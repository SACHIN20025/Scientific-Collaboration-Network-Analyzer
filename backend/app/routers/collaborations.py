from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends

from app.core.database import collaborations_collection, researchers_collection
from app.core.security import get_current_user
from app.models.collaboration import CollaborationCreate
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/collaborations", tags=["Collaborations"])


@router.get("")
async def list_collaborations(current_user: dict = Depends(get_current_user)):
    cursor = collaborations_collection.find({}).sort("created_at", -1)
    return [serialize_doc(doc) async for doc in cursor]


@router.post("", status_code=201)
async def create_collaboration(
    payload: CollaborationCreate, current_user: dict = Depends(get_current_user)
):
    doc = payload.model_dump()
    doc["created_by"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)
    result = await collaborations_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.delete("/{collab_id}", status_code=204)
async def delete_collaboration(collab_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(collab_id):
        raise HTTPException(status_code=400, detail="Invalid collaboration id")
    result = await collaborations_collection.delete_one({"_id": ObjectId(collab_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    return None


@router.get("/network")
async def get_network_graph(current_user: dict = Depends(get_current_user)):
    """Returns nodes (researchers) and edges (collaborations) for network visualization."""
    researchers = await researchers_collection.find({}).to_list(length=None)
    collabs = await collaborations_collection.find({}).to_list(length=None)

    nodes = [
        {"id": str(r["_id"]), "name": r["name"], "institution": r.get("institution")}
        for r in researchers
    ]
    edges = [
        {
            "source": c["researcher_a"],
            "target": c["researcher_b"],
            "type": c.get("collaboration_type", "co-authorship"),
        }
        for c in collabs
    ]
    return {"nodes": nodes, "edges": edges}
