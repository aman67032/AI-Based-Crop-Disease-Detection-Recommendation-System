from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.nvidia_service import client
from config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api/assistant", tags=["Assistant"])

class AssistantRequest(BaseModel):
    question: str
    context: str = ""
    language: str = "en"

@router.post("/ask")
async def ask_assistant(req: AssistantRequest):
    """Voice AI assistant endpoint."""
    lang_instruction = {
        "en": "Respond in simple English.",
        "hi": "हिंदी में जवाब दें। सरल और स्पष्ट भाषा का प्रयोग करें।",
        "ta": "எளிய தமிழில் பதிலளிக்கவும்.",
        "te": "సరళమైన తెలుగులో సమాధానం ఇవ్వండి.",
        "mr": "साध्या मराठीत उत्तर द्या.",
    }.get(req.language, "Respond in simple English.")

    system_prompt = f"""You are 'KisanAI', an expert Indian agricultural scientist.
You are talking directly to a farmer. Keep your answer conversational, very simple, and under 3 sentences.
Do not use markdown, formatting, or bullet points — this will be read aloud via Text-to-Speech.
{lang_instruction}"""

    user_prompt = f"""Farmer's Question: {req.question}
Crop Context: {req.context}"""

    try:
        response = await client.chat.completions.create(
            model=settings.NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=150,
            temperature=0.4,
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"Assistant error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate answer")
