from sqlalchemy.orm import Session

from app.core.auth_phrase import (
    MOTIVATING_PHRASE_SUGGESTIONS,
    validate_motivating_phrase,
    validate_username,
)
from sqlalchemy import text

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.core.time import utc_now
from app.models import AppSettings, User

_USER_OWNED_TABLES = (
    "momentum_events",
    "core_tasks",
    "quick_notes",
    "weekly_goals",
    "weekly_reviews",
    "short_term_goals",
    "life_goals",
    "life_areas",
)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def has_users(self) -> bool:
        return self.db.query(User.id).limit(1).first() is not None

    def phrase_suggestions(self) -> list[str]:
        return list(MOTIVATING_PHRASE_SUGGESTIONS)

    def register(self, username: str, password: str) -> tuple[User, str]:
        if self.has_users():
            # Additional accounts are allowed; each gets isolated data.
            pass

        name = validate_username(username)
        phrase = validate_motivating_phrase(password)

        if self.db.query(User).filter(User.username == name).first():
            raise ConflictError("That username is already taken")

        now = utc_now()
        user = User(
            username=name,
            password_hash=hash_password(phrase),
            created_at=now,
        )
        self.db.add(user)
        self.db.flush()

        if self._count_users() == 1:
            self._claim_orphan_rows(user.id)

        legacy = self._pop_legacy_settings()
        settings = AppSettings(
            user_id=user.id,
            timezone=legacy[0] if legacy else "UTC",
            week_starts_on=legacy[1] if legacy else 1,
            updated_at=now,
        )
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(user)

        token = create_access_token(user.id, user.username)
        return user, token

    def login(self, username: str, password: str) -> tuple[User, str]:
        name = validate_username(username)
        user = self.db.query(User).filter(User.username == name).first()
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Username or motivating phrase did not match")

        token = create_access_token(user.id, user.username)
        return user, token

    def get_user(self, user_id: int) -> User:
        user = self.db.get(User, user_id)
        if not user:
            raise UnauthorizedError("User not found")
        return user

    def _count_users(self) -> int:
        return self.db.query(User).count()

    def _pop_legacy_settings(self) -> tuple[str, int] | None:
        try:
            row = self.db.execute(
                text(
                    "SELECT timezone, week_starts_on "
                    "FROM _auth_legacy_settings LIMIT 1"
                )
            ).first()
            if row:
                self.db.execute(text("DELETE FROM _auth_legacy_settings"))
                self.db.flush()
                return row[0], row[1]
        except Exception:
            pass
        return None

    def _claim_orphan_rows(self, user_id: int) -> None:
        """Attach legacy rows (pre-auth DB) to the first registered user."""
        for table in _USER_OWNED_TABLES:
            self.db.execute(
                text(f"UPDATE {table} SET user_id = :uid WHERE user_id IS NULL"),
                {"uid": user_id},
            )
        self.db.flush()
