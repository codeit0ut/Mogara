from datetime import date

from fastapi import APIRouter, Query

from app.api.deps import MomentumServiceDep
from app.schemas import MomentumCurrentOut, MomentumEventCreate, MomentumEventOut

router = APIRouter(prefix="/momentum", tags=["momentum"])


@router.get("/current", response_model=MomentumCurrentOut)
def get_momentum_current(service: MomentumServiceDep):
    return service.get_current()


@router.get("/events", response_model=list[MomentumEventOut])
def list_momentum_events(
    service: MomentumServiceDep,
    local_date: date | None = Query(None),
):
    return service.list_events(local_date=local_date)


@router.get("/events/{event_id}", response_model=MomentumEventOut)
def get_momentum_event(event_id: int, service: MomentumServiceDep):
    return service.get_event(event_id)


@router.post("/events", response_model=MomentumEventOut, status_code=201)
def create_momentum_event(body: MomentumEventCreate, service: MomentumServiceDep):
    return service.create_event_manual(body)


@router.post("/process-inactivity", response_model=MomentumEventOut | None)
def process_inactivity(
    service: MomentumServiceDep,
    local_date: date | None = Query(None),
):
    return service.process_inactivity(local_date)
