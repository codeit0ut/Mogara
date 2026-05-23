from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.time import utc_now
from app.models import WeeklyReview
from app.schemas import WeeklyReviewCreate, WeeklyReviewUpdate
from app.services.base import apply_update, soft_delete
from app.services.momentum import MomentumService
from app.services.validators import validate_direction_state

_SUBMITTED_MUTABLE_FIELDS = frozenset({"casual_notes"})


class WeeklyReviewService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.momentum = MomentumService(db, user_id)

    def list_all(self, include_deleted: bool = False) -> list[WeeklyReview]:
        q = self.db.query(WeeklyReview).filter(WeeklyReview.user_id == self.user_id)
        if not include_deleted:
            q = q.filter(WeeklyReview.is_deleted.is_(False))
        return q.order_by(WeeklyReview.week_start.desc()).all()

    def get(self, review_id: int) -> WeeklyReview:
        review = (
            self.db.query(WeeklyReview)
            .filter(WeeklyReview.id == review_id, WeeklyReview.user_id == self.user_id)
            .first()
        )
        if not review or review.is_deleted:
            raise NotFoundError("Weekly review not found")
        return review

    def create(self, data: WeeklyReviewCreate) -> WeeklyReview:
        validate_direction_state(data.direction_state)
        self._ensure_unique_week(data.week_start)

        now = utc_now()
        review = WeeklyReview(
            **data.model_dump(),
            user_id=self.user_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(review)
        self.db.flush()
        if review.submitted_at is not None:
            self._on_submitted(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def update(self, review_id: int, data: WeeklyReviewUpdate) -> WeeklyReview:
        review = self.get(review_id)
        was_submitted = review.submitted_at is not None
        payload = data.model_dump(exclude_unset=True)

        if was_submitted:
            disallowed = set(payload.keys()) - _SUBMITTED_MUTABLE_FIELDS
            if disallowed:
                raise ValidationError(
                    "Submitted weekly reviews are locked. Only casual notes can be edited."
                )
        else:
            if "direction_state" in payload:
                validate_direction_state(payload["direction_state"])
            if "week_start" in payload:
                self._ensure_unique_week(payload["week_start"], exclude_id=review_id)

        apply_update(review, payload)
        if not was_submitted and review.submitted_at is not None:
            self._on_submitted(review)

        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review_id: int, delete_reason: str | None = None) -> None:
        review = self.get(review_id)
        soft_delete(review, delete_reason)
        self.db.commit()

    def _ensure_unique_week(self, week_start, exclude_id: int | None = None) -> None:
        q = self.db.query(WeeklyReview).filter(
            WeeklyReview.user_id == self.user_id,
            WeeklyReview.week_start == week_start,
            WeeklyReview.is_deleted.is_(False),
        )
        if exclude_id is not None:
            q = q.filter(WeeklyReview.id != exclude_id)
        if q.first():
            raise ConflictError("Weekly review for this week already exists")

    def _on_submitted(self, review: WeeklyReview) -> None:
        self.momentum.on_weekly_review_submitted(review.id, review.week_start)
