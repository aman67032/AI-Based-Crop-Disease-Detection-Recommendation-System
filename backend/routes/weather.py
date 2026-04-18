from fastapi import APIRouter, Query, HTTPException
from services.weather_service import get_current_weather, get_weather_forecast, calculate_disease_risk

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get current weather and 3-day forecast."""
    current = await get_current_weather(lat, lon)
    if not current:
        raise HTTPException(status_code=404, detail="Weather data not available")
        
    forecast = await get_weather_forecast(lat, lon)
    
    return {
        "current": current,
        "forecast": forecast
    }

@router.get("/risk")
async def get_disease_risk(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    disease: str = Query(..., description="Detected disease name")
):
    """Calculate disease risk based on current weather."""
    current = await get_current_weather(lat, lon)
    if not current:
        raise HTTPException(status_code=404, detail="Weather data not available")
        
    risk = calculate_disease_risk(current, disease)
    
    return {
        "weather": current,
        "risk": risk
    }
