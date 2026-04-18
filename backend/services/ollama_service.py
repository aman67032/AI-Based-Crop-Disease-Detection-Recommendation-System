"""
Ollama service — Local LLM fallback (Gemma4 via Ollama).
Zero cost, works offline, no API limits.
"""

import httpx
from config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


async def is_available() -> bool:
    """Check if Ollama is running locally."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


async def get_recommendation(
    disease_name: str,
    treatment_data: dict,
    language: str = "en",
    crop: str = "",
) -> str:
    """Generate recommendation using local Ollama model."""
    lang_map = {"en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "mr": "Marathi"}
    lang = lang_map.get(language, "English")

    prompt = f"""You are an expert Indian agricultural scientist.
A farmer's {crop} crop has been diagnosed with: {disease_name}

Known treatment data:
- Chemical: {treatment_data.get('chemical', 'Not available')}
- Organic: {treatment_data.get('organic', 'Not available')}
- Prevention: {treatment_data.get('prevention', 'Not available')}

Generate a clear, simple treatment recommendation in {lang}.
Include: what the disease is, immediate action, dosage, what not to do.
Keep it under 150 words. Use simple words a farmer can understand."""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                },
            )
            resp.raise_for_status()
            return resp.json().get("response", "")
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise
