from fastapi import APIRouter, Depends, Query

from app.core.database import audit_logs_collection
from app.core.security import require_roles
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/audit", tags=["Audit & Compliance"])


@router.get("")
async def list_audit_logs(
    limit: int = Query(default=100, le=500),
    current_user: dict = Depends(require_roles("system_admin", "institution_admin")),
):
    cursor = audit_logs_collection.find({}).sort("timestamp", -1).limit(limit)
    return [serialize_doc(doc) async for doc in cursor]
