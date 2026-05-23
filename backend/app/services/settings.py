from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError
from app.core.time import utc_now
from app.models import AppSettings
from app.schemas import AppSettingsUpdate
from app.services.base import apply_update


class SettingsService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def get_or_create(self) -> AppSettings:
        settings = self.db.get(AppSettings, self.user_id)
        if not settings:
            now = utc_now()
            settings = AppSettings(
                user_id=self.user_id,
                timezone="UTC",
                week_starts_on=1,
                updated_at=now,
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def update(self, data: AppSettingsUpdate) -> AppSettings:
        settings = self.get_or_create()
        payload = data.model_dump(exclude_unset=True)
        if "timezone" in payload:
            try:
                ZoneInfo(payload["timezone"])
            except Exception as exc:
                raise ValidationError(f"Invalid timezone: {payload['timezone']}") from exc
        if "week_starts_on" in payload and payload["week_starts_on"] is not None:
            if payload["week_starts_on"] < 0 or payload["week_starts_on"] > 6:
                raise ValidationError("week_starts_on must be between 0 and 6")
        apply_update(settings, payload)
        self.db.commit()
        self.db.refresh(settings)
        return settings
