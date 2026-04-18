"""
/api/recommend — Standalone recommendation endpoint.
Get AI-powered treatment advice for a known disease.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import grok_service, gemini_service, ollama_service
import json
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Recommendations"])

# Load treatment database
TREATMENT_DB = {}
treatment_path = os.path.join(os.path.dirname(__file__), "..", "data", "treatment_db.json")
try:
    with open(treatment_path, "r", encoding="utf-8") as f:
        TREATMENT_DB = json.load(f)
except FileNotFoundError:
    pass


class RecommendRequest(BaseModel):
    disease_key: str
    language: str = "en"
    crop: str = ""
    provider: str = "auto"  # auto, grok, gemini, ollama


@router.post("/recommend")
async def get_recommendation(req: RecommendRequest):
    """Get AI treatment recommendation for a disease."""
    treatment_data = TREATMENT_DB.get(req.disease_key, {})
    disease_name = req.disease_key.replace("___", " — ").replace("_", " ")

    providers = {
        "grok": grok_service.get_recommendation,
        "gemini": gemini_service.get_recommendation,
        "ollama": ollama_service.get_recommendation,
    }

    if req.provider != "auto" and req.provider in providers:
        try:
            text = await providers[req.provider](
                disease_name, treatment_data, req.language, req.crop
            )
            return {"recommendation": text, "source": req.provider, "treatment_data": treatment_data}
        except Exception as e:
            raise HTTPException(503, f"{req.provider} unavailable: {e}")

    # Auto mode — try all in order
    for name, fn in providers.items():
        try:
            if name == "ollama" and not await ollama_service.is_available():
                continue
            text = await fn(disease_name, treatment_data, req.language, req.crop)
            if text:
                return {"recommendation": text, "source": name, "treatment_data": treatment_data}
        except Exception as e:
            logger.warning(f"{name} failed: {e}")

    # Static fallback
    return {
        "recommendation": f"Disease: {disease_name}\n{json.dumps(treatment_data, indent=2)}",
        "source": "static",
        "treatment_data": treatment_data,
    }


@router.get("/treatments")
async def list_treatments():
    """List all diseases with their treatment data."""
    return {"treatments": TREATMENT_DB, "count": len(TREATMENT_DB)}


@router.get("/treatments/{disease_key}")
async def get_treatment(disease_key: str):
    """Get treatment data for a specific disease."""
    if disease_key not in TREATMENT_DB:
        raise HTTPException(404, f"Disease '{disease_key}' not found in treatment database")
    return {"disease_key": disease_key, "treatment": TREATMENT_DB[disease_key]}
