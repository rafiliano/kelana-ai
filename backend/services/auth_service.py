import bcrypt
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from models.user import User
from database import SessionLocal
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# Read secret key from .env — never hardcode secrets
SECRET_KEY                  = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM                   = "HS256"
# Token expires in 60 minutes
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# auto_error=False means missing token returns None instead of 403
# so we can return 401 consistently for both missing and invalid tokens
bearer_scheme = HTTPBearer(auto_error=False)


# Hash a plain text password using bcrypt
def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        bytes(password, encoding="utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


# Verify a plain text password against a stored hash
def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        bytes(password, encoding="utf-8"),
        bytes(hashed, encoding="utf-8"),
    )


# Generate a JWT access token for a given user id
def create_access_token(user_id: int) -> str:
    expire  = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub" : str(user_id),  # subject — who this token belongs to
        "exp" : expire,        # expiry time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# FastAPI dependency — reads JWT from Authorization header and returns the user
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> User:
    # No token provided → 401 (not 403)
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    db   = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user


# Register a new user — hashes the password before saving
def register(name: str, email: str, password: str):
    db = SessionLocal()

    # Check if email already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Never store plain text — hash the password
    user = User(
        name          = name,
        email         = email,
        password_hash = hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


# Login — verify password and return a JWT token
def login(email: str, password: str) -> dict:
    db   = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    db.close()

    # User not found or wrong password — same error message for security
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code = 401,
            detail      = "Invalid email or password",
        )

    token = create_access_token(user.id)

    return {
        "access_token" : token,
        "token_type"   : "bearer",
    }
