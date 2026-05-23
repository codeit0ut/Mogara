from fastapi import APIRouter, Query

from app.api.deps import LifeGoalServiceDep
from app.schemas import LifeGoalCreate, LifeGoalOut, LifeGoalUpdate

router = APIRouter(prefix="/life-goals", tags=["life-goals"])


@router.get("", response_model=list[LifeGoalOut])
def list_life_goals(
    service: LifeGoalServiceDep,
    life_area_id: int | None = None,
    include_deleted: bool = False,
):
    return service.list_all(life_area_id=life_area_id, include_deleted=include_deleted)


@router.get("/{goal_id}", response_model=LifeGoalOut)
def get_life_goal(goal_id: int, service: LifeGoalServiceDep):
    return service.get(goal_id)


@router.post("", response_model=LifeGoalOut, status_code=201)
def create_life_goal(body: LifeGoalCreate, service: LifeGoalServiceDep):
    return service.create(body)


@router.patch("/{goal_id}", response_model=LifeGoalOut)
def update_life_goal(goal_id: int, body: LifeGoalUpdate, service: LifeGoalServiceDep):
    return service.update(goal_id, body)


@router.delete("/{goal_id}", status_code=204)
def delete_life_goal(
    goal_id: int,
    service: LifeGoalServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(goal_id, delete_reason)
