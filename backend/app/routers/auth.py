from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends

from app.core.database import users_collection, researchers_collection, audit_logs_collection
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.models.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.models.common import serialize_doc

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "role": payload.role.value,
        "created_at": datetime.now(timezone.utc),
        "is_active": True,
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # auto-create researcher profile
    await researchers_collection.insert_one(
        {
            "user_id": user_id,
            "name": payload.name,
            "email": payload.email,
            "department": payload.department,
            "institution": payload.institution_name,
            "skills": [],
            "research_interests": [],
            "affiliations": [payload.institution_name] if payload.institution_name else [],
            "bio": None,
            "orcid": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    )

    await audit_logs_collection.insert_one(
        {
            "user_id": user_id,
            "action": "register",
            "details": f"User {payload.email} registered",
            "timestamp": datetime.now(timezone.utc),
        }
    )

    token = create_access_token({"sub": user_id, "role": payload.role.value})
    user_out = UserOut(
        id=user_id,
        name=payload.name,
        email=payload.email,
        role=payload.role,
        created_at=user_doc["created_at"],
    )
    return TokenResponse(access_token=token, user=user_out)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})

    await audit_logs_collection.insert_one(
        {
            "user_id": user_id,
            "action": "login",
            "details": f"User {payload.email} logged in",
            "timestamp": datetime.now(timezone.utc),
        }
    )

    user_out = UserOut(
        id=user_id,
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"],
    )
    return TokenResponse(access_token=token, user=user_out)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
    )
