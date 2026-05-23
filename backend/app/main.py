from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.api.router import api_router
from app.core.exceptions import AppError
from app.database import SessionLocal, init_db
from app.models import User
from app.services.momentum import MomentumService


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        recorded = 0
        for user in db.query(User).all():
            recorded += MomentumService(db, user.id).run_daily_inactivity_check()
        if recorded:
            print(f"[life-tracker] Applied {recorded} missed inactivity day(s) on startup")
    except Exception as exc:
        # Do not block the app from starting if catch-up fails.
        print(f"[life-tracker] Inactivity catch-up skipped: {exc}")
    finally:
        db.close()
    yield


app = FastAPI(title="Life Tracker", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={
            "detail": "Database constraint violation (duplicate or invalid reference)"
        },
    )


app.include_router(api_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
