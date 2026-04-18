from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from database.mongo import get_db

router = APIRouter(prefix="/api/diseases", tags=["Diseases"])

@router.get("/")
async def get_all_diseases(
    search: str = Query(None, description="Search term for disease name or symptoms"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Fetch the crop diseases ML dataset from the database.
    Optionally filter by a search query.
    """
    query = {}
    if search:
        # Case-insensitive regex search in name or description
        regex = {"$regex": search, "$options": "i"}
        query = {
            "$or": [
                {"name": regex},
                {"description_en": regex},
                {"description_hi": regex}
            ]
        }
        
    cursor = db.diseases.find(query).sort("name", 1)
    diseases = await cursor.to_list(length=100)
    
    # Format for frontend
    formatted_diseases = []
    for d in diseases:
        formatted_diseases.append({
            "id": str(d["_id"]),
            "key": d.get("disease_key"),
            "name": d.get("name"),
            "symptoms": d.get("description_en"),
            "treatment": d.get("chemical", "") + " | Organic: " + d.get("organic", ""),
            "prevention": d.get("prevention")
        })
        
    return {"diseases": formatted_diseases}
