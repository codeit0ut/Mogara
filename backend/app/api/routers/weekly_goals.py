from fastapi import APIRouter, Query

from app.api.deps import WeeklyGoalServiceDep
from app.schemas import WeeklyGoalCreate, WeeklyGoalOut, WeeklyGoalUpdate

router = APIRouter(prefix="/weekly-goals", tags=["weekly-goals"])


@router.get("", response_model=list[WeeklyGoalOut])
def list_weekly_goals(
    service: WeeklyGoalServiceDep,
    short_term_goal_id: int | None = None,
    life_goal_id: int | None = None,
    include_deleted: bool = False,
):
    return service.list_all(
        short_term_goal_id=short_term_goal_id,
        life_goal_id=life_goal_id,
        include_deleted=include_deleted,
    )


@router.get("/{goal_id}", response_model=WeeklyGoalOut)
def get_weekly_goal(goal_id: int, service: WeeklyGoalServiceDep):
    return service.get(goal_id)


@router.post("", response_model=WeeklyGoalOut, status_code=201)
def create_weekly_goal(body: WeeklyGoalCreate, service: WeeklyGoalServiceDep):
    return service.create(body)


@router.patch("/{goal_id}", response_model=WeeklyGoalOut)
def update_weekly_goal(
    goal_id: int, body: WeeklyGoalUpdate, service: WeeklyGoalServiceDep
):
    return service.update(goal_id, body)


@router.delete("/{goal_id}", status_code=204)
def delete_weekly_goal(
    goal_id: int,
    service: WeeklyGoalServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(goal_id, delete_reason)
