"""MongoDB Atlas database connection using Motor."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings

settings = get_settings()

client = None
db: AsyncIOMotorDatabase = None

async def init_db():
    """Initialize MongoDB connection and perform any necessary setup."""
    global client, db
    
    print("[INIT] Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    # Send a ping to confirm a successful connection
    try:
        await client.admin.command('ping')
        print("[OK] Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"[ERROR] Could not connect to MongoDB: {e}")
        raise e
        
    db = client["kisanai_db"]
    
    # Create necessary indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("phone", unique=True)
    await db.crops.create_index("name", unique=True)
    await db.disease_treatments.create_index("disease_key", unique=True)

    print("[OK] MongoDB collections and indexes verified")

def get_db() -> AsyncIOMotorDatabase:
    """Dependency — yields the MongoDB database instance."""
    return db
