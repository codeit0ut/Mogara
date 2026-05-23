from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class LifeAreaCreate(BaseModel):
    """User-defined category (e.g. Engineering, Health). No predefined list."""

    label: str


class LifeAreaUpdate(BaseModel):
    label: str | None = None


class LifeAreaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    label: str
    created_at: datetime
    updated_at: datetime


class LifeGoalCreate(BaseModel):
    title: str
    summary: str | None = None
    motivation: str | None = None
    symbol: str | None = None
    life_area_id: int | None = None
    status: str = "active"


class LifeGoalUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    motivation: str | None = None
    symbol: str | None = None
    life_area_id: int | None = None
    status: str | None = None


class LifeGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    summary: str | None
    motivation: str | None
    symbol: str | None
    life_area_id: int | None
    status: str
    is_deleted: bool
    deleted_at: datetime | None
    delete_reason: str | None
    created_at: datetime
    updated_at: datetime


class ShortTermGoalCreate(BaseModel):
    life_goal_id: int
    title: str
    summary: str | None = None
    target_date: date | None = None
    status: str = "active"


class ShortTermGoalUpdate(BaseModel):
    life_goal_id: int | None = None
    title: str | None = None
    summary: str | None = None
    target_date: date | None = None
    status: str | None = None


class ShortTermGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    life_goal_id: int
    title: str
    summary: str | None
    target_date: date | None
    status: str
    is_deleted: bool
    deleted_at: datetime | None
    delete_reason: str | None
    created_at: datetime
    updated_at: datetime


class WeeklyGoalCreate(BaseModel):
    title: str
    summary: str | None = None
    week_start: datetime
    week_end: datetime
    short_term_goal_id: int
    status: str = "active"


class WeeklyGoalUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    week_start: datetime | None = None
    week_end: datetime | None = None
    short_term_goal_id: int | None = None
    status: str | None = None


class WeeklyGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    summary: str | None
    week_start: datetime
    week_end: datetime
    short_term_goal_id: int
    status: str
    is_deleted: bool
    deleted_at: datetime | None
    delete_reason: str | None
    created_at: datetime
    updated_at: datetime


class CoreTaskCreate(BaseModel):
    task_date: date
    title: str
    notes: str | None = None
    weekly_goal_id: int | None = None
    scheduled_for: datetime | None = None
    scheduled_end: datetime | None = None
    completed_at: datetime | None = None
    status: str = "active"


class CoreTaskUpdate(BaseModel):
    task_date: date | None = None
    title: str | None = None
    notes: str | None = None
    weekly_goal_id: int | None = None
    scheduled_for: datetime | None = None
    scheduled_end: datetime | None = None
    completed_at: datetime | None = None
    status: str | None = None


class CoreTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_date: date
    title: str
    notes: str | None
    weekly_goal_id: int | None
    scheduled_for: datetime | None
    scheduled_end: datetime | None
    completed_at: datetime | None
    status: str
    is_deleted: bool
    deleted_at: datetime | None
    delete_reason: str | None
    created_at: datetime
    updated_at: datetime


class QuickNoteCreate(BaseModel):
    body: str
    note_date: date | None = None


class QuickNoteUpdate(BaseModel):
    body: str | None = None
    note_date: date | None = None


class QuickNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    body: str
    note_date: date | None
    is_deleted: bool
    deleted_at: datetime | None
    delete_reason: str | None
    created_at: datetime
    updated_at: datetime


class MomentumEventCreate(BaseModel):
    event_type: str
    change: int
    occurred_at: datetime
    local_date: date
    core_task_id: int | None = None
    weekly_review_id: int | None = None
    metadata_json: str | None = None


class MomentumCurrentOut(BaseModel):
    value: int
    min: int
    max: int
    start: int


class MomentumEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    change: int
    occurred_at: datetime
    local_date: date
    core_task_id: int | None
    weekly_review_id: int | None
    metadata_json: str | None
    created_at: datetime


class WeeklyReviewCreate(BaseModel):
    week_start: datetime
    week_end: datetime
    wins: str | None = None
    friction: str | None = None
    learnings: str | None = None
    emotional_reflection: str | None = None
    distractions: str | None = None
    direction_state: str | None = None
    direction_note: str | None = None
    next_week_intent: str | None = None
    casual_notes: str | None = None
    submitted_at: datetime | None = None


class WeeklyReviewUpdate(BaseModel):
    week_start: datetime | None = None
    week_end: datetime | None = None
    wins: str | None = None
    friction: str | None = None
    learnings: str | None = None
    emotional_reflection: str | None = None
    distractions: str | None = None
    direction_state: str | None = None
    direction_note: str | None = None
    next_week_intent: str | None = None
    casual_notes: str | None = None
    submitted_at: datetime | None = None


class WeeklyReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    week_start: datetime
    week_end: datetime
    wins: str | None
    friction: str | None
    learnings: str | None
    emotional_reflection: str | None
    distractions: str | None
    direction_state: str | None
    direction_note: str | None
    next_week_intent: str | None
    casual_notes: str | None
    submitted_at: datetime | None
    is_deleted: bool
    deleted_at: datetime | None
    delete_reason: str | None
    created_at: datetime
    updated_at: datetime


class AppSettingsUpdate(BaseModel):
    timezone: str | None = None
    week_starts_on: int | None = None


class AppSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    timezone: str
    week_starts_on: int
    updated_at: datetime


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    created_at: datetime


class AuthStatusOut(BaseModel):
    has_users: bool
    phrase_suggestions: list[str]


class RegisterIn(BaseModel):
    username: str
    password: str


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

