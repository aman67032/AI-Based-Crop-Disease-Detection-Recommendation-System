"""
Grok API service (xAI) — Primary AI provider.
Uses OpenAI-compatible SDK pointed at xAI's endpoint.
Supports both text recommendations and vision (image analysis).
"""

from openai import AsyncOpenAI
from config import get_settings
import base64
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

client = AsyncOpenAI(
    api_key=settings.GROK_API_KEY,
    base_url=settings.GROK_BASE_URL,
)

SYSTEM_PROMPT = """You are an expert Indian agricultural scientist and plant pathologist.
You help farmers understand crop diseases and provide actionable treatment advice.
Keep your language simple — a rural farmer with basic education should understand everything.
Be specific about dosages, timing, and application methods.
Always mention both chemical and organic options.
Keep responses under 200 words."""


async def get_recommendation(
    disease_name: str,
    treatment_data: dict,
    language: str = "en",
    crop: str = "",
) -> str:
    """Generate treatment recommendation using Grok API."""
    lang_instruction = {
        "en": "Respond in simple English.",
        "hi": "हिंदी में जवाब दें। सरल शब्दों का उपयोग करें।",
        "ta": "எளிய தமிழில் பதிலளிக்கவும்.",
        "te": "సరళమైన తెలుగులో సమాధానం ఇవ్వండి.",
        "mr": "साध्या मराठीत उत्तर द्या.",
    }.get(language, "Respond in simple English.")

    prompt = f"""A farmer's {crop} crop has been diagnosed with: {disease_name}

Known treatment data:
- Chemical: {treatment_data.get('chemical', 'Not available')}
- Organic: {treatment_data.get('organic', 'Not available')}
- Prevention: {treatment_data.get('prevention', 'Not available')}
- Urgency: {treatment_data.get('urgency', 'MEDIUM')}

Generate a clear, simple recommendation for a rural Indian farmer. Include:
1. What this disease is (1 simple sentence)
2. Immediate action to take
3. Dosage and application method
4. What NOT to do
5. When to expect recovery

{lang_instruction}
Keep it under 150 words."""

    try:
        response = await client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=500,
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Grok API error: {e}")
        raise


async def analyze_image_with_grok(image_bytes: bytes, crop_hint: str = "") -> str:
    """Send leaf image to Grok for secondary visual analysis."""
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    hint = f" The farmer says this is a {crop_hint} crop." if crop_hint else ""

    try:
        response = await client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_image}",
                            "detail": "high",
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            f"Identify the plant disease in this leaf image.{hint} "
                            "Provide: disease name, confidence (low/medium/high), "
                            "and one sentence description. Be concise."
                        ),
                    },
                ],
            }],
            max_tokens=200,
        )
        result = response.choices[0].message.content
        if not result:
            raise ValueError("Grok returned empty response")
        return result
    except Exception as e:
        logger.error(f"Grok Vision error: {e}")
        raise  # Let caller handle it
