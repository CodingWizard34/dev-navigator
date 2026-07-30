import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import requests
from jwt import PyJWKClient

from models import get_db, User

security = HTTPBearer()

# Clerk gives us a JWKS endpoint to verify token signatures dynamically
# It usually looks like https://clerk.your-domain.com/.well-known/jwks.json
# We read this from the env variable CLERK_JWKS_URL or fallback to the known dev domain
CLERK_JWKS_URL = os.environ.get("CLERK_JWKS_URL", "https://fit-ibex-95.clerk.accounts.dev/.well-known/jwks.json")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    if not CLERK_JWKS_URL:
        # Fallback for local development if user hasn't set up Clerk yet
        # IN PRODUCTION: ALWAYS verify the token
        print("WARNING: CLERK_JWKS_URL not set. Trusting token blindly for dev.")
        try:
            # Decode without verification just to extract user_id
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            user_id = unverified_payload.get("sub")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token format")
    else:
        try:
            jwks_client = PyJWKClient(CLERK_JWKS_URL)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"]
            )
            user_id = payload.get("sub")
        except jwt.PyJWKClientError as e:
            raise HTTPException(status_code=401, detail="Could not verify token signature")
        except jwt.DecodeError as e:
            raise HTTPException(status_code=401, detail="Invalid token")

    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject (user id)")

    # Check if user exists in our DB, if not, create them! (Auto-registration)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email=f"{user_id}@clerk.local")
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
