"""
/api/detect — Main disease detection endpoint.
Receives leaf image → runs CNN → gets AI recommendation → saves to DB.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from database.mongo import get_db
from ml.model_inference import predict
from services import nvidia_service, grok_service, gemini_service, ollama_service
import json
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Detection"])

# Load treatment database
TREATMENT_DB = {}
treatment_path = os.path.join(os.path.dirname(__file__), "..", "data", "treatment_db.json")
try:
    with open(treatment_path, "r", encoding="utf-8") as f:
        TREATMENT_DB = json.load(f)
except FileNotFoundError:
    logger.warning("treatment_db.json not found — recommendations will use AI only")


async def _get_ai_recommendation(
    disease_name: str, treatment_data: dict, language: str, crop: str
) -> tuple[str, str]:
    """Try AI providers in order: NVIDIA → Grok → Gemini → Ollama → static fallback."""

    # 1. Try NVIDIA API (Llama 4 Maverick)
    try:
        text = await nvidia_service.get_recommendation(disease_name, treatment_data, language, crop)
        if text:
            return text, "nvidia"
    except Exception as e:
        logger.warning(f"NVIDIA failed: {e}")

    # 2. Try Grok API
    try:
        text = await grok_service.get_recommendation(disease_name, treatment_data, language, crop)
        if text:
            return text, "grok"
    except Exception as e:
        logger.warning(f"Grok failed: {e}")

    # 3. Try Gemini API
    try:
        text = await gemini_service.get_recommendation(disease_name, treatment_data, language, crop)
        if text:
            return text, "gemini"
    except Exception as e:
        logger.warning(f"Gemini failed: {e}")

    # 4. Try Ollama (local)
    try:
        if await ollama_service.is_available():
            text = await ollama_service.get_recommendation(disease_name, treatment_data, language, crop)
            if text:
                return text, "ollama"
    except Exception as e:
        logger.warning(f"Ollama failed: {e}")

    # 5. Static fallback
    fallback = f"""Disease: {disease_name}
Chemical Treatment: {treatment_data.get('chemical', 'Consult local agronomist')}
Organic Option: {treatment_data.get('organic', 'Neem oil spray')}
Prevention: {treatment_data.get('prevention', 'Crop rotation and field sanitation')}
Urgency: {treatment_data.get('urgency', 'MEDIUM')}"""
    return fallback, "static"


@router.post("/detect")
async def detect_disease(
    file: UploadFile = File(...),
    crop_type: str = Form(""),
    language: str = Form("en"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Upload a leaf image → get disease detection + treatment recommendation.
    If CNN confidence is low (<85%), automatically uses Gemini Vision for better accuracy.
    """
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg", "image/webp"):
        raise HTTPException(400, "Only JPEG, PNG, or WebP images are accepted")

    # Read image bytes
    image_bytes = await file.read()
    if len(image_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(400, "Image too large (max 20MB)")

    # 1. Run CNN inference
    result = predict(image_bytes)
    primary = result["primary"]
    disease_key = primary["class_key"]
    cnn_confidence = primary["confidence"]

    # 2. If CNN confidence is low, try Vision AI for better accuracy
    vision_analysis = ""
    vision_source = ""
    if cnn_confidence < 85:
        logger.info(f"Low CNN confidence ({cnn_confidence}%), trying Vision AI...")
        # Try NVIDIA first
        try:
            vision_analysis = await nvidia_service.analyze_image_with_nvidia(image_bytes, crop_type)
            vision_source = "nvidia_vision"
        except Exception as e:
            logger.warning(f"NVIDIA Vision failed: {e}")
        # Try Gemini
        if not vision_analysis:
            try:
                vision_analysis = await gemini_service.analyze_image_with_gemini(image_bytes, crop_type)
                vision_source = "gemini_vision"
            except Exception as e:
                logger.warning(f"Gemini Vision failed: {e}")
        # Try Grok
        if not vision_analysis:
            try:
                vision_analysis = await grok_service.analyze_image_with_grok(image_bytes, crop_type)
                vision_source = "grok_vision"
            except Exception as e:
                logger.warning(f"Grok Vision failed: {e}")

    # 3. Look up treatment data
    treatment_data = TREATMENT_DB.get(disease_key, {})

    # 4. Get AI recommendation (if not healthy)
    rec_text = ""
    rec_source = "none"
    if not primary["is_healthy"]:
        rec_text, rec_source = await _get_ai_recommendation(
            primary["disease"], treatment_data, language, primary["crop"]
        )

    # 5. Save detection to database
    from datetime import datetime, timezone
    
    detection_doc = {
        "crop_type": crop_type or primary["crop"],
        "disease_name": disease_key,
        "confidence": primary["confidence"],
        "severity": result["severity"],
        "top_predictions": result["predictions"],
        "image_filename": file.filename,
        "image_data": image_bytes,  # Store as binary in Mongo
        "vision_analysis": vision_analysis,  # Store vision result if available
        "vision_source": vision_source,
        "created_at": datetime.now(timezone.utc)
    }
    
    insert_result = await db.detections.insert_one(detection_doc)
    detection_id = insert_result.inserted_id

    # 6. Save recommendation
    if rec_text:
        recommendation_doc = {
            "detection_id": detection_id,
            "treatment_text": rec_text,
            "language": language,
            "source": rec_source,
            "created_at": datetime.now(timezone.utc)
        }
        await db.recommendations.insert_one(recommendation_doc)

    # 7. Build response
    return {
        "id": str(detection_id),
        "detection": {
            "disease": primary["disease"],
            "disease_key": disease_key,
            "crop": primary["crop"],
            "confidence": primary["confidence"],
            "is_healthy": primary["is_healthy"],
            "severity": result["severity"],
        },
        "predictions": result["predictions"],
        "recommendation": {
            "text": rec_text,
            "source": rec_source,
            "treatment_data": treatment_data,
        },
        "vision_analysis": vision_analysis if vision_analysis else None,
        "vision_source": vision_source if vision_source else None,
        "model_version": result["model_version"],
    }


@router.post("/detect/vision")
async def detect_with_vision(
    file: UploadFile = File(...),
    crop_type: str = Form(""),
):
    """
    Secondary detection using Grok/Gemini vision API (no CNN).
    Useful for cross-validation or when CNN model is unavailable.
    """
    image_bytes = await file.read()

    # Try Grok Vision first, then Gemini
    analysis = ""
    source = ""
    try:
        analysis = await grok_service.analyze_image_with_grok(image_bytes, crop_type)
        source = "grok_vision"
    except Exception:
        try:
            analysis = await gemini_service.analyze_image_with_gemini(image_bytes, crop_type)
            source = "gemini_vision"
        except Exception as e:
            raise HTTPException(503, f"No vision API available: {e}")

    return {
        "analysis": analysis,
        "source": source,
    }
