"""
KisanAI — FastAPI Backend Entry Point.
AI-powered crop disease detection & smart advisory system.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import get_settings
from database.postgres import init_db
from ml.model_inference import load_model
from routes import detect, history, recommend, auth
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + load ML model. Shutdown: cleanup."""
    logger.info("Starting Kisan Sathi backend...")

    # Initialize PostgreSQL tables
    await init_db()

    # Load PyTorch model (singleton)
    load_model()

    logger.info("[OK] Kisan Sathi backend ready!")
    yield
    logger.info("Kisan Sathi backend shutting down")


app = FastAPI(
    title="Kisan Sathi API",
    description="AI-powered crop disease detection & treatment recommendation for Indian farmers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(detect.router)
app.include_router(history.router)
app.include_router(recommend.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
