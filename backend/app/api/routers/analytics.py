from datetime import date

from fastapi import APIRouter, Query

from app.api.deps import AnalyticsServiceDep

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/energy")
def energy_allocation(service: AnalyticsServiceDep):
    return service.energy_allocation()


@router.get("/momentum-journey")
def momentum_journey(service: AnalyticsServiceDep):
    return service.momentum_journey()


@router.get("/day-activity")
def day_activity(
    service: AnalyticsServiceDep,
    from_date: date = Query(...),
    to_date: date = Query(...),
):
    return service.day_activity(from_date, to_date)
