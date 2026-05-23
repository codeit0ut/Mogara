from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.time import utc_now
from app.models import ShortTermGoal, WeeklyGoal
from app.schemas import WeeklyGoalCreate, WeeklyGoalUpdate
from app.services.base import apply_update, soft_delete
from app.services.validators import (
    filter_active_goals,
    require_short_term_goal,
    validate_goal_status,
)


class WeeklyGoalService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def list_all(
        self,
        short_term_goal_id: int | None = None,
        life_goal_id: int | None = None,
        include_deleted: bool = False,
    ) -> list[WeeklyGoal]:
        q = self.db.query(WeeklyGoal).filter(WeeklyGoal.user_id == self.user_id)
        if not include_deleted:
            q = filter_active_goals(q, WeeklyGoal, self.user_id)
        if short_term_goal_id is not None:
            q = q.filter(WeeklyGoal.short_term_goal_id == short_term_goal_id)
        if life_goal_id is not None:
            q = q.join(
                ShortTermGoal, WeeklyGoal.short_term_goal_id == ShortTermGoal.id
            ).filter(
                ShortTermGoal.life_goal_id == life_goal_id,
                ShortTermGoal.user_id == self.user_id,
            )
        return q.order_by(WeeklyGoal.week_start.desc()).all()

    def get(self, goal_id: int) -> WeeklyGoal:
        goal = (
            self.db.query(WeeklyGoal)
            .filter(WeeklyGoal.id == goal_id, WeeklyGoal.user_id == self.user_id)
            .first()
        )
        if not goal or goal.is_deleted:
            raise NotFoundError("Weekly goal not found")
        return goal

    def create(self, data: WeeklyGoalCreate) -> WeeklyGoal:
        validate_goal_status(data.status)
        require_short_term_goal(self.db, data.short_term_goal_id, self.user_id)

        now = utc_now()
        goal = WeeklyGoal(
            **data.model_dump(),
            user_id=self.user_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def update(self, goal_id: int, data: WeeklyGoalUpdate) -> WeeklyGoal:
        goal = self.get(goal_id)
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload:
            validate_goal_status(payload["status"])
        if "short_term_goal_id" in payload and payload["short_term_goal_id"] is not None:
            require_short_term_goal(self.db, payload["short_term_goal_id"], self.user_id)
        apply_update(goal, payload)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def delete(self, goal_id: int, delete_reason: str | None = None) -> None:
        goal = self.get(goal_id)
        soft_delete(goal, delete_reason)
        self.db.commit()
