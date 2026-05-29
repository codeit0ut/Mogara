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


@router.get("/weekly-analysis")
def weekly_analysis(
    service: AnalyticsServiceDep,
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
):
    return service.weekly_analysis(month)


@router.get("/monthly-analysis")
def monthly_analysis(
    service: AnalyticsServiceDep,
    year: str = Query(..., pattern=r"^\d{4}$"),
):
    return service.monthly_analysis(year)
