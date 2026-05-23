from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import AuthStatusOut, LoginIn, RegisterIn, TokenOut, UserOut
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status", response_model=AuthStatusOut)
def auth_status(db: Session = Depends(get_db)):
    svc = AuthService(db)
    return AuthStatusOut(
        has_users=svc.has_users(),
        phrase_suggestions=svc.phrase_suggestions(),
    )


@router.post("/register", response_model=TokenOut, status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    user, token = AuthService(db).register(body.username, body.password)
    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user, token = AuthService(db).login(body.username, body.password)
    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)
