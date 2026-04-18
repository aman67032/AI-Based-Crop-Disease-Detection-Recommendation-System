"""PostgreSQL database connection and models using SQLAlchemy async."""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey, JSON, Boolean
from datetime import datetime, timezone
from config import get_settings

settings = get_settings()

# ── Engine & Session ──────────────────────────────────────────────────────────

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    language_pref: Mapped[str] = mapped_column(String(10), default="en")
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    detections = relationship("Detection", back_populates="user", cascade="all, delete-orphan")


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    crop_type: Mapped[str] = mapped_column(String(50), nullable=False)
    disease_name: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(10), nullable=False)  # LOW, MEDIUM, HIGH
    top_predictions: Mapped[dict] = mapped_column(JSON, nullable=True)
    image_filename: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="detections")
    recommendation = relationship("Recommendation", back_populates="detection", uselist=False, cascade="all, delete-orphan")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    detection_id: Mapped[int] = mapped_column(Integer, ForeignKey("detections.id"), nullable=False)
    treatment_text: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    source: Mapped[str] = mapped_column(String(20), default="grok")  # grok or ollama
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    detection = relationship("Detection", back_populates="recommendation")


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name_hi: Mapped[str] = mapped_column(String(100), nullable=True)
    icon: Mapped[str] = mapped_column(String(10), nullable=True)  # Emoji
    diseases: Mapped[dict] = mapped_column(JSON, nullable=True)  # List of disease keys


class DiseaseTreatment(Base):
    __tablename__ = "disease_treatments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    disease_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    disease_name: Mapped[str] = mapped_column(String(100), nullable=False)
    disease_name_hi: Mapped[str] = mapped_column(String(200), nullable=True)
    crop: Mapped[str] = mapped_column(String(50), nullable=False)
    chemical: Mapped[str] = mapped_column(Text, nullable=True)
    organic: Mapped[str] = mapped_column(Text, nullable=True)
    prevention: Mapped[str] = mapped_column(Text, nullable=True)
    urgency: Mapped[str] = mapped_column(String(10), default="MEDIUM")
    description_en: Mapped[str] = mapped_column(Text, nullable=True)
    description_hi: Mapped[str] = mapped_column(Text, nullable=True)


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    detection_id: Mapped[int] = mapped_column(Integer, ForeignKey("detections.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    comment: Mapped[str] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=True)  # Was the detection correct?
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# ── Database Init ─────────────────────────────────────────────────────────────

async def init_db():
    """Create all tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] PostgreSQL tables created/verified")


async def get_db() -> AsyncSession:
    """Dependency — yields a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
