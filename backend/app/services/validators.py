from sqlalchemy.orm import Query, Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models import (
    CoreTask,
    DirectionState,
    GoalStatus,
    LifeArea,
    LifeGoal,
    MomentumEventType,
    ShortTermGoal,
    WeeklyGoal,
)


def validate_goal_status(status: str) -> str:
    allowed = {s.value for s in GoalStatus}
    if status not in allowed:
        raise ValidationError(f"status must be one of: {', '.join(sorted(allowed))}")
    return status


def validate_direction_state(state: str | None) -> str | None:
    if state is None:
        return None
    allowed = {s.value for s in DirectionState}
    if state not in allowed:
        raise ValidationError(
            f"direction_state must be one of: {', '.join(sorted(allowed))}"
        )
    return state


def validate_momentum_event_type(event_type: str) -> str:
    allowed = {e.value for e in MomentumEventType}
    if event_type not in allowed:
        raise ValidationError(
            f"event_type must be one of: {', '.join(sorted(allowed))}"
        )
    return event_type


def require_life_area(db: Session, life_area_id: int, user_id: int) -> LifeArea:
    area = (
        db.query(LifeArea)
        .filter(LifeArea.id == life_area_id, LifeArea.user_id == user_id)
        .first()
    )
    if not area:
        raise NotFoundError("Life area not found")
    return area


def require_life_goal(db: Session, life_goal_id: int, user_id: int) -> LifeGoal:
    goal = (
        db.query(LifeGoal)
        .filter(LifeGoal.id == life_goal_id, LifeGoal.user_id == user_id)
        .first()
    )
    if not goal or goal.is_deleted:
        raise NotFoundError("Life goal not found")
    return goal


def require_short_term_goal(db: Session, goal_id: int, user_id: int) -> ShortTermGoal:
    goal = (
        db.query(ShortTermGoal)
        .filter(ShortTermGoal.id == goal_id, ShortTermGoal.user_id == user_id)
        .first()
    )
    if not goal or goal.is_deleted:
        raise NotFoundError("Short-term goal not found")
    return goal


def require_weekly_goal(db: Session, goal_id: int, user_id: int) -> WeeklyGoal:
    goal = (
        db.query(WeeklyGoal)
        .filter(WeeklyGoal.id == goal_id, WeeklyGoal.user_id == user_id)
        .first()
    )
    if not goal or goal.is_deleted:
        raise NotFoundError("Weekly goal not found")
    return goal


def require_core_task(db: Session, task_id: int, user_id: int) -> CoreTask:
    task = (
        db.query(CoreTask)
        .filter(CoreTask.id == task_id, CoreTask.user_id == user_id)
        .first()
    )
    if not task or task.is_deleted:
        raise NotFoundError("Core task not found")
    return task


def filter_active_goals(query: Query, model, user_id: int) -> Query:
    return query.filter(
        model.user_id == user_id,
        model.is_deleted.is_(False),
        model.status != GoalStatus.ARCHIVED.value,
    )
