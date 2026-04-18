"""
/api/auth — Simple JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from database.mongo import get_db
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


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user exists
    if req.email:
        existing = await db.users.find_one({"email": req.email})
        if existing:
            raise HTTPException(400, "Email already registered")

    user_doc = {
        "name": req.name,
        "email": req.email or None,
        "phone": req.phone or None,
        "password_hash": pwd_context.hash(req.password),
        "language_pref": req.language_pref,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    return {
        "user": {"id": user_id, "name": req.name, "email": req.email},
        "token": create_token(user_id),
    }


@router.post("/login")
async def login(req: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Find user by email or phone
    query = {}
    if req.email:
        query["email"] = req.email
    elif req.phone:
        query["phone"] = req.phone
    else:
        raise HTTPException(400, "Provide email or phone")

    user = await db.users.find_one(query)

    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    return {
        "user": {"id": str(user["_id"]), "name": user.get("name"), "email": user.get("email")},
        "token": create_token(str(user["_id"])),
    }
