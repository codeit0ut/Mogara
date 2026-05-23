import json
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError
from app.core.time import utc_now
from app.core.timezone import local_today, local_yesterday, to_local_date
from app.models import CoreTask, GoalStatus, MomentumEvent, MomentumEventType
from app.schemas import MomentumEventCreate
from app.services.settings import SettingsService
from app.services.validators import validate_momentum_event_type

MOMENTUM_START = 100
MOMENTUM_MIN = 50
MOMENTUM_MAX = 1000
DAILY_GAIN_CAP = 25
DAILY_INACTIVITY_CAP = 20

CHANGE_CORE_TASK = 5
CHANGE_ALL_TASKS_DAY = 10
CHANGE_WEEKLY_REVIEW = 20
CHANGE_RECOVERY = 10


class MomentumService:
    def __init__(
        self, db: Session, user_id: int, settings: SettingsService | None = None
    ):
        self.db = db
        self.user_id = user_id
        self.settings = settings or SettingsService(db, user_id)

    def _timezone(self) -> str:
        return self.settings.get_or_create().timezone

    def list_events(self, local_date: date | None = None) -> list[MomentumEvent]:
        q = self.db.query(MomentumEvent).filter(MomentumEvent.user_id == self.user_id)
        if local_date is not None:
            q = q.filter(MomentumEvent.local_date == local_date)
        return q.order_by(MomentumEvent.occurred_at.desc()).all()

    def get_event(self, event_id: int) -> MomentumEvent:
        from app.core.exceptions import NotFoundError

        event = (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.id == event_id,
                MomentumEvent.user_id == self.user_id,
            )
            .first()
        )
        if not event:
            raise NotFoundError("Momentum event not found")
        return event

    def create_event_manual(self, data: MomentumEventCreate) -> MomentumEvent | None:
        raise ValidationError(
            "Manual momentum events are disabled. Complete tasks, submit weekly "
            "reviews, or call POST /api/momentum/process-inactivity."
        )

    def get_current(self) -> dict:
        raw = MOMENTUM_START + sum(
            e.change
            for e in self.db.query(MomentumEvent)
            .filter(MomentumEvent.user_id == self.user_id)
            .all()
        )
        return {
            "value": max(MOMENTUM_MIN, min(MOMENTUM_MAX, raw)),
            "min": MOMENTUM_MIN,
            "max": MOMENTUM_MAX,
            "start": MOMENTUM_START,
        }

    def process_inactivity(self, local_date: date | None = None) -> MomentumEvent | None:
        if local_date is None:
            local_date = local_yesterday(self._timezone())
        if not self._is_inactive_day(local_date):
            return None
        if self._has_event_type_on_date(MomentumEventType.INACTIVITY_DAY.value, local_date):
            return None

        streak = self._consecutive_inactive_streak(local_date)
        change = -min(DAILY_INACTIVITY_CAP, 4 * streak)
        event = self._record_event(
            event_type=MomentumEventType.INACTIVITY_DAY.value,
            change=change,
            local_date=local_date,
            metadata_json=json.dumps({"consecutive_days": streak}),
            respect_daily_cap=False,
        )
        if event:
            self.db.commit()
            self.db.refresh(event)
        return event

    def catch_up_inactivity(self, lookback_days: int = 90) -> int:
        """
        Apply missed inactivity days from oldest to yesterday (user timezone).
        Safe to run on every startup — days already recorded or not inactive are skipped.
        """
        if lookback_days < 1:
            return 0
        yesterday = local_yesterday(self._timezone())
        first = yesterday - timedelta(days=lookback_days - 1)
        recorded = 0
        day = first
        while day <= yesterday:
            if self.process_inactivity(day):
                recorded += 1
            day += timedelta(days=1)
        return recorded

    def run_daily_inactivity_check(self) -> int:
        """Startup hook: catch up inactivity for days missed while the server was off."""
        return self.catch_up_inactivity()

    def on_core_task_completed(self, task: CoreTask) -> None:
        local_date = task.task_date
        if not self._has_core_task_completion_event(task.id):
            self._record_event(
                event_type=MomentumEventType.CORE_TASK_COMPLETED.value,
                change=CHANGE_CORE_TASK,
                local_date=local_date,
                core_task_id=task.id,
            )
        self._maybe_award_all_tasks_for_day(local_date)
        self._maybe_award_recovery(local_date)

    def on_core_task_uncompleted(self, task: CoreTask) -> None:
        local_date = task.task_date
        if self._has_core_task_completion_event(task.id):
            self._record_event(
                event_type=MomentumEventType.CORE_TASK_UNCOMPLETED.value,
                change=-CHANGE_CORE_TASK,
                local_date=local_date,
                core_task_id=task.id,
                respect_daily_cap=False,
            )
        self._maybe_reverse_all_tasks_for_day(local_date)

    def on_weekly_review_submitted(self, review_id: int, week_start) -> None:
        local_date = to_local_date(week_start, self._timezone())
        if self._has_weekly_review_completed_event(review_id):
            return
        self._record_event(
            event_type=MomentumEventType.WEEKLY_REVIEW_COMPLETED.value,
            change=CHANGE_WEEKLY_REVIEW,
            local_date=local_date,
            weekly_review_id=review_id,
        )

    def _maybe_award_all_tasks_for_day(self, local_date: date) -> None:
        if self._has_event_type_on_date(
            MomentumEventType.ALL_CORE_TASKS_COMPLETED_FOR_DAY.value, local_date
        ):
            return
        tasks = self._tasks_for_date(local_date)
        if not tasks:
            return
        if all(t.completed_at is not None for t in tasks):
            self._record_event(
                event_type=MomentumEventType.ALL_CORE_TASKS_COMPLETED_FOR_DAY.value,
                change=CHANGE_ALL_TASKS_DAY,
                local_date=local_date,
            )

    def _maybe_reverse_all_tasks_for_day(self, local_date: date) -> None:
        if not self._has_event_type_on_date(
            MomentumEventType.ALL_CORE_TASKS_COMPLETED_FOR_DAY.value, local_date
        ):
            return
        if self._has_event_type_on_date(
            MomentumEventType.ALL_CORE_TASKS_DAY_REVERSED.value, local_date
        ):
            return
        tasks = self._tasks_for_date(local_date)
        if tasks and not all(t.completed_at is not None for t in tasks):
            self._record_event(
                event_type=MomentumEventType.ALL_CORE_TASKS_DAY_REVERSED.value,
                change=-CHANGE_ALL_TASKS_DAY,
                local_date=local_date,
                respect_daily_cap=False,
            )

    def _maybe_award_recovery(self, local_date: date) -> None:
        if self._has_event_type_on_date(
            MomentumEventType.RECOVERY_AFTER_INACTIVITY.value, local_date
        ):
            return
        yesterday = local_date - timedelta(days=1)
        if not self._has_event_type_on_date(
            MomentumEventType.INACTIVITY_DAY.value, yesterday
        ):
            return
        self._record_event(
            event_type=MomentumEventType.RECOVERY_AFTER_INACTIVITY.value,
            change=CHANGE_RECOVERY,
            local_date=local_date,
        )

    def _record_event(
        self,
        *,
        event_type: str,
        change: int,
        local_date: date,
        occurred_at=None,
        core_task_id: int | None = None,
        weekly_review_id: int | None = None,
        metadata_json: str | None = None,
        respect_daily_cap: bool = True,
    ) -> MomentumEvent | None:
        validate_momentum_event_type(event_type)

        if respect_daily_cap and change > 0:
            change = self._apply_daily_gain_cap(change, local_date)
            if change == 0:
                return None

        event = MomentumEvent(
            user_id=self.user_id,
            event_type=event_type,
            change=change,
            occurred_at=occurred_at or utc_now(),
            local_date=local_date,
            core_task_id=core_task_id,
            weekly_review_id=weekly_review_id,
            metadata_json=metadata_json,
            created_at=utc_now(),
        )
        self.db.add(event)
        self.db.flush()
        return event

    def _apply_daily_gain_cap(self, change: int, local_date: date) -> int:
        gained = self._positive_change_for_date(local_date)
        allowed = max(0, DAILY_GAIN_CAP - gained)
        return min(change, allowed)

    def _positive_change_for_date(self, local_date: date) -> int:
        events = (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.user_id == self.user_id,
                MomentumEvent.local_date == local_date,
                MomentumEvent.change > 0,
            )
            .all()
        )
        return sum(e.change for e in events)

    def _has_core_task_completion_event(self, core_task_id: int) -> bool:
        events = (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.user_id == self.user_id,
                MomentumEvent.core_task_id == core_task_id,
            )
            .all()
        )
        net = sum(
            e.change
            for e in events
            if e.event_type
            in (
                MomentumEventType.CORE_TASK_COMPLETED.value,
                MomentumEventType.CORE_TASK_UNCOMPLETED.value,
            )
        )
        return net > 0

    def _has_weekly_review_completed_event(self, review_id: int) -> bool:
        return (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.user_id == self.user_id,
                MomentumEvent.weekly_review_id == review_id,
                MomentumEvent.event_type
                == MomentumEventType.WEEKLY_REVIEW_COMPLETED.value,
            )
            .first()
            is not None
        )

    def _has_event_type_on_date(self, event_type: str, local_date: date) -> bool:
        if event_type == MomentumEventType.ALL_CORE_TASKS_COMPLETED_FOR_DAY.value:
            if (
                self.db.query(MomentumEvent)
                .filter(
                    MomentumEvent.user_id == self.user_id,
                    MomentumEvent.local_date == local_date,
                    MomentumEvent.event_type
                    == MomentumEventType.ALL_CORE_TASKS_DAY_REVERSED.value,
                )
                .first()
            ):
                return False
        return (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.user_id == self.user_id,
                MomentumEvent.local_date == local_date,
                MomentumEvent.event_type == event_type,
            )
            .first()
            is not None
        )

    def _tasks_for_date(self, local_date: date) -> list[CoreTask]:
        return (
            self.db.query(CoreTask)
            .filter(
                CoreTask.user_id == self.user_id,
                CoreTask.task_date == local_date,
                CoreTask.is_deleted.is_(False),
                CoreTask.status != GoalStatus.ARCHIVED.value,
            )
            .all()
        )

    def _day_has_core_tasks(self, local_date: date) -> bool:
        return len(self._tasks_for_date(local_date)) > 0

    def _is_day_active(self, local_date: date) -> bool:
        return any(t.completed_at is not None for t in self._tasks_for_date(local_date))

    def _is_inactive_day(self, local_date: date) -> bool:
        if not self._day_has_core_tasks(local_date):
            return False
        return not self._is_day_active(local_date)

    def _consecutive_inactive_streak(self, end_date: date) -> int:
        streak = 0
        current = end_date
        while self._is_inactive_day(current):
            streak += 1
            current -= timedelta(days=1)
            if streak > 365:
                break
        return max(streak, 1)
