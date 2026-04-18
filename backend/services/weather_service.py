import httpx
import logging
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

BASE_URL = "https://api.openweathermap.org/data/2.5"

async def get_current_weather(lat: float, lon: float) -> dict:
    """Fetch current weather data for the given coordinates."""
    if not settings.OPENWEATHER_API_KEY:
        logger.warning("OPENWEATHER_API_KEY is not set.")
        return {}

    url = f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            return {
                "temp": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "wind_speed": data["wind"]["speed"],
                "location": data["name"]
            }
    except Exception as e:
        logger.error(f"Error fetching weather: {e}")
        return {}

async def get_weather_forecast(lat: float, lon: float) -> list:
    """Fetch 5-day weather forecast (every 3 hours)."""
    if not settings.OPENWEATHER_API_KEY:
        return []

    url = f"{BASE_URL}/forecast?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # Extract one forecast per day (e.g., around noon)
            daily_forecasts = []
            seen_dates = set()
            for item in data["list"]:
                date = item["dt_txt"].split(" ")[0]
                if date not in seen_dates:
                    seen_dates.add(date)
                    daily_forecasts.append({
                        "date": date,
                        "temp": item["main"]["temp"],
                        "humidity": item["main"]["humidity"],
                        "description": item["weather"][0]["description"],
                        "icon": item["weather"][0]["icon"]
                    })
                if len(daily_forecasts) == 3:  # Just get the next 3 days
                    break
            return daily_forecasts
    except Exception as e:
        logger.error(f"Error fetching forecast: {e}")
        return []

def calculate_disease_risk(weather_data: dict, disease_name: str) -> dict:
    """Calculate disease risk based on current weather conditions."""
    if not weather_data:
        return {"level": "UNKNOWN", "message": "Weather data unavailable."}

    humidity = weather_data.get("humidity", 0)
    temp = weather_data.get("temp", 0)
    desc = weather_data.get("description", "").lower()
    
    disease = disease_name.lower()
    
    is_fungal = any(x in disease for x in ["rot", "blight", "spot", "mildew", "rust", "mold", "scab"])
    is_bacterial = "bacterial" in disease
    is_raining = "rain" in desc or "drizzle" in desc
    
    if is_healthy(disease):
        return {
            "level": "LOW",
            "message": "Crop is healthy. Keep monitoring weather conditions."
        }

    if is_fungal and humidity > 80:
        return {
            "level": "CRITICAL",
            "message": "High humidity (>80%) accelerates fungal spread. Immediate fungicide application recommended."
        }
        
    if is_fungal and is_raining:
        return {
            "level": "HIGH",
            "message": "Rain promotes spore dispersal. Apply protective fungicide once rain stops."
        }
        
    if is_bacterial and (20 <= temp <= 30) and humidity > 70:
        return {
            "level": "HIGH",
            "message": "Warm, humid conditions favor bacterial growth. Ensure good drainage and airflow."
        }
        
    return {
        "level": "MODERATE",
        "message": "Current weather poses a moderate risk. Continue standard treatment protocol."
    }

def is_healthy(disease: str) -> bool:
    return "healthy" in disease.lower()
