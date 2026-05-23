from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.hierarchy import chain_from_task
from app.models import CoreTask, GoalStatus, MomentumEvent
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
