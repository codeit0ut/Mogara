import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GoalStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class DirectionState(str, enum.Enum):
    WANDERING = "wandering"
    STRUGGLING = "struggling"
    MOVING = "moving"
    GROUNDED = "grounded"
    FLOWING = "flowing"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )


class MomentumEventType(str, enum.Enum):
    CORE_TASK_COMPLETED = "core_task_completed"
    CORE_TASK_UNCOMPLETED = "core_task_uncompleted"
    ALL_CORE_TASKS_COMPLETED_FOR_DAY = "all_core_tasks_completed_for_day"
    ALL_CORE_TASKS_DAY_REVERSED = "all_core_tasks_completed_for_day_reversed"
    WEEKLY_REVIEW_COMPLETED = "weekly_review_completed"
    RECOVERY_AFTER_INACTIVITY = "recovery_after_inactivity"
    INACTIVITY_DAY = "inactivity_day"


class LifeArea(Base):
    __tablename__ = "life_areas"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_life_areas_user_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    life_goals: Mapped[list["LifeGoal"]] = relationship(back_populates="life_area")


class LifeGoal(Base):
    __tablename__ = "life_goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    summary: Mapped[str | None] = mapped_column(String(512))
    motivation: Mapped[str | None] = mapped_column(String(512))
    symbol: Mapped[str | None] = mapped_column(String(32))
    life_area_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("life_areas.id")
    )
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default=GoalStatus.ACTIVE.value
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delete_reason: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    life_area: Mapped["LifeArea | None"] = relationship(back_populates="life_goals")
    short_term_goals: Mapped[list["ShortTermGoal"]] = relationship(
        back_populates="life_goal"
    )


class ShortTermGoal(Base):
    __tablename__ = "short_term_goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    life_goal_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("life_goals.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    summary: Mapped[str | None] = mapped_column(String(512))
    target_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default=GoalStatus.ACTIVE.value
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delete_reason: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    life_goal: Mapped["LifeGoal"] = relationship(back_populates="short_term_goals")
    weekly_goals: Mapped[list["WeeklyGoal"]] = relationship(
        back_populates="short_term_goal"
    )


class WeeklyGoal(Base):
    __tablename__ = "weekly_goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    summary: Mapped[str | None] = mapped_column(String(512))
    week_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    week_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    short_term_goal_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("short_term_goals.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default=GoalStatus.ACTIVE.value
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delete_reason: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    short_term_goal: Mapped["ShortTermGoal"] = relationship(back_populates="weekly_goals")
    core_tasks: Mapped[list["CoreTask"]] = relationship(back_populates="weekly_goal")


class CoreTask(Base):
    __tablename__ = "core_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    task_date: Mapped[date] = mapped_column(Date, nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    weekly_goal_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("weekly_goals.id")
    )
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    scheduled_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default=GoalStatus.ACTIVE.value
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delete_reason: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    weekly_goal: Mapped["WeeklyGoal | None"] = relationship(back_populates="core_tasks")
    momentum_events: Mapped[list["MomentumEvent"]] = relationship(
        back_populates="core_task"
    )


class QuickNote(Base):
    __tablename__ = "quick_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    note_date: Mapped[date | None] = mapped_column(Date)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delete_reason: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )


class MomentumEvent(Base):
    __tablename__ = "momentum_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    change: Mapped[int] = mapped_column(Integer, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    local_date: Mapped[date] = mapped_column(Date, nullable=False)
    core_task_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("core_tasks.id")
    )
    weekly_review_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("weekly_reviews.id")
    )
    metadata_json: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    core_task: Mapped["CoreTask | None"] = relationship(
        back_populates="momentum_events"
    )
    weekly_review: Mapped["WeeklyReview | None"] = relationship(
        back_populates="momentum_events"
    )


class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_weekly_reviews_user_week"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    week_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    week_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    wins: Mapped[str | None] = mapped_column(Text)
    friction: Mapped[str | None] = mapped_column(Text)
    learnings: Mapped[str | None] = mapped_column(Text)
    emotional_reflection: Mapped[str | None] = mapped_column(Text)
    distractions: Mapped[str | None] = mapped_column(Text)
    direction_state: Mapped[str | None] = mapped_column(String(16))
    direction_note: Mapped[str | None] = mapped_column(String(512))
    next_week_intent: Mapped[str | None] = mapped_column(Text)
    casual_notes: Mapped[str | None] = mapped_column(Text)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delete_reason: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    momentum_events: Mapped[list["MomentumEvent"]] = relationship(
        back_populates="weekly_review"
    )


class AppSettings(Base):
    __tablename__ = "app_settings"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), primary_key=True
    )
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="UTC")
    week_starts_on: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    __table_args__ = (
        CheckConstraint("week_starts_on >= 0 AND week_starts_on <= 6", name="ck_week_starts_on"),
    )
