from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

# Collections
users_collection = db["users"]
researchers_collection = db["researchers"]
institutions_collection = db["institutions"]
publications_collection = db["publications"]
collaborations_collection = db["collaborations"]
projects_collection = db["projects"]
conferences_collection = db["conferences"]
citations_collection = db["citations"]
audit_logs_collection = db["audit_logs"]


async def ensure_indexes():
    await users_collection.create_index("email", unique=True)
    await researchers_collection.create_index("user_id", unique=True)
    await publications_collection.create_index("title")
    await conferences_collection.create_index("name")
