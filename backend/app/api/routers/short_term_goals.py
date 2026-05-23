from fastapi import APIRouter, Query

from app.api.deps import ShortTermGoalServiceDep
from app.schemas import ShortTermGoalCreate, ShortTermGoalOut, ShortTermGoalUpdate

router = APIRouter(prefix="/short-term-goals", tags=["short-term-goals"])


@router.get("", response_model=list[ShortTermGoalOut])
def list_short_term_goals(
    service: ShortTermGoalServiceDep,
    life_goal_id: int | None = None,
    include_deleted: bool = False,
):
    return service.list_all(life_goal_id=life_goal_id, include_deleted=include_deleted)


@router.get("/{goal_id}", response_model=ShortTermGoalOut)
def get_short_term_goal(goal_id: int, service: ShortTermGoalServiceDep):
    return service.get(goal_id)


@router.post("", response_model=ShortTermGoalOut, status_code=201)
def create_short_term_goal(body: ShortTermGoalCreate, service: ShortTermGoalServiceDep):
    return service.create(body)


@router.patch("/{goal_id}", response_model=ShortTermGoalOut)
def update_short_term_goal(
    goal_id: int, body: ShortTermGoalUpdate, service: ShortTermGoalServiceDep
):
    return service.update(goal_id, body)


@router.delete("/{goal_id}", status_code=204)
def delete_short_term_goal(
    goal_id: int,
    service: ShortTermGoalServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(goal_id, delete_reason)
