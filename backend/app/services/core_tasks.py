from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.time import utc_now
from app.models import CoreTask
from app.schemas import CoreTaskCreate, CoreTaskUpdate
from app.services.base import apply_update, soft_delete
from app.services.momentum import MomentumService
from app.services.validators import (
    filter_active_goals,
    require_weekly_goal,
    validate_goal_status,
)


class CoreTaskService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.momentum = MomentumService(db, user_id)

    def list_all(
        self, task_date: date | None = None, include_deleted: bool = False
    ) -> list[CoreTask]:
        q = self.db.query(CoreTask).filter(CoreTask.user_id == self.user_id)
        if not include_deleted:
            q = filter_active_goals(q, CoreTask, self.user_id)
        if task_date is not None:
            q = q.filter(CoreTask.task_date == task_date)
        return q.order_by(CoreTask.task_date.desc(), CoreTask.id).all()

    def get(self, task_id: int) -> CoreTask:
        task = (
            self.db.query(CoreTask)
            .filter(CoreTask.id == task_id, CoreTask.user_id == self.user_id)
            .first()
        )
        if not task or task.is_deleted:
            raise NotFoundError("Core task not found")
        return task

    def create(self, data: CoreTaskCreate) -> CoreTask:
        validate_goal_status(data.status)
        self._validate_optional_fks(data)

        now = utc_now()
        task = CoreTask(
            **data.model_dump(),
            user_id=self.user_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(task)
        self.db.flush()
        if task.completed_at is not None:
            self.momentum.on_core_task_completed(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task_id: int, data: CoreTaskUpdate) -> CoreTask:
        task = self.get(task_id)
        was_completed = task.completed_at is not None
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload:
            validate_goal_status(payload["status"])
        self._validate_optional_fks(payload)

        apply_update(task, payload)
        now_completed = task.completed_at is not None

        if not was_completed and now_completed:
            self.momentum.on_core_task_completed(task)
        elif was_completed and not now_completed:
            self.momentum.on_core_task_uncompleted(task)

        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task_id: int, delete_reason: str | None = None) -> None:
        task = self.get(task_id)
        if task.completed_at is not None:
            self.momentum.on_core_task_uncompleted(task)
        soft_delete(task, delete_reason)
        self.db.commit()

    def _validate_optional_fks(self, data) -> None:
        payload = data.model_dump() if hasattr(data, "model_dump") else data
        if payload.get("weekly_goal_id") is not None:
            require_weekly_goal(self.db, payload["weekly_goal_id"], self.user_id)
