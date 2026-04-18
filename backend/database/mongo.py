"""MongoDB Atlas database connection using Motor."""

import json
import os
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
    
    # Seed diseases dataset
    await seed_diseases()

async def seed_diseases():
    """Seeds the MongoDB diseases collection with the ML dataset if empty."""
    global db
    if db is None: return
    
    count = await db.diseases.count_documents({})
    if count == 0:
        print("[INIT] Seeding diseases dataset into MongoDB...")
        try:
            file_path = os.path.join(os.path.dirname(__file__), "..", "data", "treatment_db.json")
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                documents = []
                for key, value in data.items():
                    doc = value.copy()
                    doc["disease_key"] = key
                    doc["name"] = key.replace("___", " - ").replace("_", " ")
                    documents.append(doc)
                
                if documents:
                    await db.diseases.insert_many(documents)
                    print(f"[OK] Successfully seeded {len(documents)} diseases into database.")
            else:
                print(f"[WARN] treatment_db.json not found at {file_path}")
        except Exception as e:
            print(f"[ERROR] Failed to seed diseases: {e}")

def get_db() -> AsyncIOMotorDatabase:
    """Dependency — yields the MongoDB database instance."""
    return db
