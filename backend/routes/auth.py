"""
/api/auth — Simple JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from database.postgres import get_db, User
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    password: str
    language_pref: str = "en"


class LoginRequest(BaseModel):
    email: str = ""
    phone: str = ""
    password: str


def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    if req.email:
        existing = await db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise HTTPException(400, "Email already registered")

    user = User(
        name=req.name,
        email=req.email or None,
        phone=req.phone or None,
        password_hash=pwd_context.hash(req.password),
        language_pref=req.language_pref,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "token": create_token(user.id),
    }


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find user by email or phone
    query = select(User)
    if req.email:
        query = query.where(User.email == req.email)
    elif req.phone:
        query = query.where(User.phone == req.phone)
    else:
        raise HTTPException(400, "Provide email or phone")

    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(req.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    return {
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "token": create_token(user.id),
    }
