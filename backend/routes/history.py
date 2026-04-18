"""
/api/history — Detection history CRUD.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database.postgres import get_db, Detection, Recommendation
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history")
async def list_detections(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    crop: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List past detections with optional crop filter."""
    query = select(Detection).order_by(desc(Detection.created_at))
    if crop:
        query = query.where(Detection.crop_type == crop)
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    detections = result.scalars().all()

    return {
        "detections": [
            {
                "id": d.id,
                "crop_type": d.crop_type,
                "disease_name": d.disease_name,
                "confidence": d.confidence,
                "severity": d.severity,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in detections
        ],
        "count": len(detections),
    }


@router.get("/history/{detection_id}")
async def get_detection(detection_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific detection with its recommendation."""
    query = (
        select(Detection)
        .options(selectinload(Detection.recommendation))
        .where(Detection.id == detection_id)
    )
    result = await db.execute(query)
    detection = result.scalar_one_or_none()

    if not detection:
        raise HTTPException(404, "Detection not found")

    rec = detection.recommendation
    return {
        "id": detection.id,
        "crop_type": detection.crop_type,
        "disease_name": detection.disease_name,
        "confidence": detection.confidence,
        "severity": detection.severity,
        "top_predictions": detection.top_predictions,
        "image_filename": detection.image_filename,
        "created_at": detection.created_at.isoformat() if detection.created_at else None,
        "recommendation": {
            "text": rec.treatment_text if rec else None,
            "language": rec.language if rec else None,
            "source": rec.source if rec else None,
        } if rec else None,
    }


@router.delete("/history/{detection_id}")
async def delete_detection(detection_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a detection record."""
    query = select(Detection).where(Detection.id == detection_id)
    result = await db.execute(query)
    detection = result.scalar_one_or_none()

    if not detection:
        raise HTTPException(404, "Detection not found")

    await db.delete(detection)
    await db.commit()
    return {"message": "Detection deleted", "id": detection_id}
