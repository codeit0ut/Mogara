export type GoalStatus = "active" | "completed" | "archived";
export type DirectionState =
  | "wandering"
  | "struggling"
  | "moving"
  | "grounded"
  | "flowing";

export interface LifeArea {
  id: number;
  name: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface LifeGoal {
  id: number;
  title: string;
  summary: string | null;
  motivation: string | null;
  symbol: string | null;
  life_area_id: number | null;
  status: GoalStatus;
  is_deleted: boolean;
  deleted_at: string | null;
  delete_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShortTermGoal {
  id: number;
  life_goal_id: number;
  title: string;
  summary: string | null;
  target_date: string | null;
  status: GoalStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyGoal {
  id: number;
  title: string;
  summary: string | null;
  week_start: string;
  week_end: string;
  short_term_goal_id: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface CoreTask {
  id: number;
  task_date: string;
  title: string;
  notes: string | null;
  weekly_goal_id: number | null;
  scheduled_for: string | null;
  scheduled_end: string | null;
  completed_at: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface NoteTemplate {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface QuickNote {
  id: number;
  body: string;
  note_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MomentumEvent {
  id: number;
  event_type: string;
  change: number;
  occurred_at: string;
  local_date: string;
  core_task_id: number | null;
  weekly_review_id: number | null;
  metadata_json: string | null;
  created_at: string;
}

export interface MomentumCurrent {
  value: number;
  min: number;
  max: number;
  start: number;
}

export interface WeeklyReview {
  id: number;
  week_start: string;
  week_end: string;
  wins: string | null;
  friction: string | null;
  learnings: string | null;
  emotional_reflection: string | null;
  distractions: string | null;
  direction_state: DirectionState | null;
  direction_note: string | null;
  next_week_intent: string | null;
  casual_notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  user_id: number;
  timezone: string;
  week_starts_on: number;
  updated_at: string;
}

export interface MomentumPoint {
  occurred_at: string;
  value: number;
}

export interface WeeklyAnalysisWeek {
  week_start: string;
  week_end: string;
  momentum_delta: number;
  tasks_set: number;
  tasks_completed: number;
  momentum_points: MomentumPoint[];
}

export interface MonthlyAnalysisMonth {
  month_start: string;
  month_end: string;
  momentum_delta: number;
  tasks_set: number;
  tasks_completed: number;
  momentum_points: MomentumPoint[];
}
