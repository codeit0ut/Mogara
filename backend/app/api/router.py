from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.routers import (
    analytics,
    auth,
    core_tasks,
    life_areas,
    life_goals,
    momentum,
    note_templates,
    quick_notes,
    settings,
    short_term_goals,
    weekly_goals,
    weekly_reviews,
)

api_router = APIRouter()
api_router.include_router(auth.router)

protected = APIRouter(dependencies=[Depends(get_current_user)])
protected.include_router(life_areas.router)
protected.include_router(life_goals.router)
protected.include_router(short_term_goals.router)
protected.include_router(weekly_goals.router)
protected.include_router(core_tasks.router)
protected.include_router(note_templates.router)
protected.include_router(quick_notes.router)
protected.include_router(momentum.router)
protected.include_router(weekly_reviews.router)
protected.include_router(settings.router)
protected.include_router(analytics.router)

api_router.include_router(protected)
