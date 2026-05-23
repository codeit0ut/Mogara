from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.time import utc_now
from app.models import ShortTermGoal
from app.schemas import ShortTermGoalCreate, ShortTermGoalUpdate
from app.services.base import apply_update, soft_delete
from app.services.validators import (
    filter_active_goals,
    require_life_goal,
    validate_goal_status,
)


class ShortTermGoalService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def list_all(
        self, life_goal_id: int | None = None, include_deleted: bool = False
    ) -> list[ShortTermGoal]:
        q = self.db.query(ShortTermGoal).filter(ShortTermGoal.user_id == self.user_id)
        if not include_deleted:
            q = filter_active_goals(q, ShortTermGoal, self.user_id)
        if life_goal_id is not None:
            q = q.filter(ShortTermGoal.life_goal_id == life_goal_id)
        return q.order_by(ShortTermGoal.id).all()

    def get(self, goal_id: int) -> ShortTermGoal:
        goal = (
            self.db.query(ShortTermGoal)
            .filter(ShortTermGoal.id == goal_id, ShortTermGoal.user_id == self.user_id)
            .first()
        )
        if not goal or goal.is_deleted:
            raise NotFoundError("Short-term goal not found")
        return goal

    def create(self, data: ShortTermGoalCreate) -> ShortTermGoal:
        validate_goal_status(data.status)
        require_life_goal(self.db, data.life_goal_id, self.user_id)

        now = utc_now()
        goal = ShortTermGoal(
            **data.model_dump(),
            user_id=self.user_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def update(self, goal_id: int, data: ShortTermGoalUpdate) -> ShortTermGoal:
        goal = self.get(goal_id)
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload:
            validate_goal_status(payload["status"])
        if "life_goal_id" in payload and payload["life_goal_id"] is not None:
            require_life_goal(self.db, payload["life_goal_id"], self.user_id)
        apply_update(goal, payload)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def delete(self, goal_id: int, delete_reason: str | None = None) -> None:
        goal = self.get(goal_id)
        soft_delete(goal, delete_reason)
        self.db.commit()
