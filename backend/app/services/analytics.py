from calendar import monthrange
from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError
from app.core.week_bounds import week_end_date, week_start_date
from app.hierarchy import chain_from_task
from app.models import CoreTask, GoalStatus, MomentumEvent
from app.services.settings import SettingsService
from app.services.momentum import MOMENTUM_MAX, MOMENTUM_MIN, MOMENTUM_START

START = MOMENTUM_START


class AnalyticsService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def energy_allocation(self) -> list[dict]:
        tasks = (
            self.db.query(CoreTask)
            .filter(
                CoreTask.user_id == self.user_id,
                CoreTask.is_deleted.is_(False),
                CoreTask.completed_at.isnot(None),
            )
            .all()
        )
        counts: dict[str, int] = {}
        for t in tasks:
            chain = chain_from_task(self.db, t)
            label = chain["life_area_label"] or "Unassigned"
            counts[label] = counts.get(label, 0) + 1
        return [
            {"label": label, "count": count}
            for label, count in sorted(counts.items(), key=lambda x: -x[1])
        ]

    def momentum_journey(self) -> list[dict]:
        events = (
            self.db.query(MomentumEvent)
            .filter(MomentumEvent.user_id == self.user_id)
            .order_by(MomentumEvent.occurred_at.asc())
            .all()
        )
        value = START
        points = [{"date": None, "value": value, "occurred_at": None}]
        for e in events:
            value = max(MOMENTUM_MIN, min(MOMENTUM_MAX, value + e.change))
            points.append(
                {
                    "date": e.local_date.isoformat(),
                    "value": value,
                    "occurred_at": e.occurred_at.isoformat(),
                    "event_type": e.event_type,
                    "change": e.change,
                }
            )
        return points[1:] if len(points) > 1 else []

    def day_activity(
        self, from_date: date, to_date: date
    ) -> list[dict]:
        result = []
        current = from_date
        while current <= to_date:
            tasks = (
                self.db.query(CoreTask)
                .filter(
                    CoreTask.user_id == self.user_id,
                    CoreTask.task_date == current,
                    CoreTask.is_deleted.is_(False),
                    CoreTask.status != GoalStatus.ARCHIVED.value,
                )
                .all()
            )
            if not tasks:
                status = "neutral"
            elif any(t.completed_at for t in tasks):
                status = "active"
            else:
                status = "inactive"
            result.append({"date": current.isoformat(), "status": status})
            current += timedelta(days=1)
        return result

    def weekly_analysis(self, month: str) -> list[dict]:
        try:
            month_start = datetime.strptime(month, "%Y-%m").date().replace(day=1)
        except ValueError as exc:
            raise ValidationError("month must be in YYYY-MM format") from exc

        month_end = month_start.replace(
            day=monthrange(month_start.year, month_start.month)[1]
        )
        week_starts_on = SettingsService(self.db, self.user_id).get_or_create().week_starts_on

        first_week = week_start_date(month_start, week_starts_on)
        last_week = week_start_date(month_end, week_starts_on)

        weeks: list[dict] = []
        cursor = first_week
        while cursor <= last_week:
            w_end = week_end_date(cursor)
            stats = self._period_stats(cursor, w_end, growth_chart=True)
            weeks.append(
                {
                    "week_start": cursor.isoformat(),
                    "week_end": w_end.isoformat(),
                    **stats,
                }
            )
            cursor += timedelta(days=7)

        return weeks

    def monthly_analysis(self, year: str) -> list[dict]:
        try:
            year_num = int(year)
        except ValueError as exc:
            raise ValidationError("year must be a four-digit number") from exc
        if year_num < 2000 or year_num > 2100:
            raise ValidationError("year must be between 2000 and 2100")

        months: list[dict] = []
        for month_num in range(1, 13):
            month_start = date(year_num, month_num, 1)
            month_end = month_start.replace(
                day=monthrange(year_num, month_num)[1]
            )
            stats = self._period_stats(month_start, month_end, growth_chart=True)
            months.append(
                {
                    "month_start": month_start.isoformat(),
                    "month_end": month_end.isoformat(),
                    **stats,
                }
            )
        return months

    def _period_stats(
        self, period_start: date, period_end: date, *, growth_chart: bool = False
    ) -> dict:
        tasks = (
            self.db.query(CoreTask)
            .filter(
                CoreTask.user_id == self.user_id,
                CoreTask.task_date >= period_start,
                CoreTask.task_date <= period_end,
                CoreTask.is_deleted.is_(False),
                CoreTask.status != GoalStatus.ARCHIVED.value,
            )
            .all()
        )
        tasks_set = len(tasks)
        tasks_completed = sum(1 for t in tasks if t.completed_at is not None)

        events = (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.user_id == self.user_id,
                MomentumEvent.local_date >= period_start,
                MomentumEvent.local_date <= period_end,
            )
            .order_by(MomentumEvent.occurred_at.asc())
            .all()
        )
        momentum_delta = sum(e.change for e in events)
        if growth_chart:
            momentum_points = self._momentum_growth_points(
                period_start, period_end, events
            )
        else:
            start_value = self._momentum_value_before(period_start)
            momentum_points = self._momentum_points(
                period_start, period_end, start_value, events
            )
        return {
            "momentum_delta": momentum_delta,
            "tasks_set": tasks_set,
            "tasks_completed": tasks_completed,
            "momentum_points": momentum_points,
        }

    def _momentum_value_before(self, target_date: date) -> int:
        events = (
            self.db.query(MomentumEvent)
            .filter(
                MomentumEvent.user_id == self.user_id,
                MomentumEvent.local_date < target_date,
            )
            .order_by(MomentumEvent.occurred_at.asc())
            .all()
        )
        value = START
        for event in events:
            value = self._clamp_momentum(value + event.change)
        return value

    def _momentum_points(
        self,
        week_start: date,
        week_end: date,
        start_value: int,
        events: list[MomentumEvent],
    ) -> list[dict]:
        points = [
            {
                "occurred_at": datetime.combine(week_start, time.min).isoformat(),
                "value": start_value,
            }
        ]
        value = start_value
        for event in events:
            value = self._clamp_momentum(value + event.change)
            points.append({"occurred_at": event.occurred_at.isoformat(), "value": value})

        points.append(
            {
                "occurred_at": datetime.combine(week_end, time.max).isoformat(),
                "value": value,
            }
        )
        return points

    def _momentum_growth_points(
        self,
        period_start: date,
        period_end: date,
        events: list[MomentumEvent],
    ) -> list[dict]:
        """Cumulative change within the period only (starts at 0)."""
        running = 0
        points = [
            {
                "occurred_at": datetime.combine(period_start, time.min).isoformat(),
                "value": 0,
            }
        ]
        for event in events:
            running += event.change
            points.append({"occurred_at": event.occurred_at.isoformat(), "value": running})
        points.append(
            {
                "occurred_at": datetime.combine(period_end, time.max).isoformat(),
                "value": running,
            }
        )
        return points

    def _clamp_momentum(self, value: int) -> int:
        return max(MOMENTUM_MIN, min(MOMENTUM_MAX, value))
