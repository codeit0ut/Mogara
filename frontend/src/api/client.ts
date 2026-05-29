import { notifySessionInvalid } from "../auth/session";
import { getAuthToken, setAuthToken } from "../auth/token";
import type {
  AppSettings,
  CoreTask,
  LifeArea,
  LifeGoal,
  MomentumCurrent,
  MomentumEvent,
  MonthlyAnalysisMonth,
  NoteTemplate,
  QuickNote,
  ShortTermGoal,
  WeeklyAnalysisWeek,
  WeeklyGoal,
  WeeklyReview,
} from "./types";

export type User = {
  id: number;
  username: string;
  created_at: string;
};

export type AuthStatus = {
  has_users: boolean;
  phrase_suggestions: string[];
};

export type TokenOut = {
  access_token: string;
  token_type: string;
  user: User;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const isAuthRoute =
      path.startsWith("/auth/login") || path.startsWith("/auth/register");
    if (res.status === 401 && !isAuthRoute) {
      if (token) setAuthToken(null);
      notifySessionInvalid();
    }
    throw new Error(
      typeof body.detail === "string" ? body.detail : "Something went wrong"
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    status: () => request<AuthStatus>("/auth/status"),
    register: (username: string, password: string) =>
      request<TokenOut>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    login: (username: string, password: string) =>
      request<TokenOut>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    me: () => request<User>("/auth/me"),
  },
  lifeAreas: {
    list: () => request<LifeArea[]>("/life-areas"),
    create: (label: string) =>
      request<LifeArea>("/life-areas", {
        method: "POST",
        body: JSON.stringify({ label }),
      }),
    remove: (id: number) =>
      request<void>(`/life-areas/${id}`, { method: "DELETE" }),
  },
  lifeGoals: {
    list: () => request<LifeGoal[]>("/life-goals"),
    create: (data: Partial<LifeGoal> & { title: string }) =>
      request<LifeGoal>("/life-goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<LifeGoal>) =>
      request<LifeGoal>(`/life-goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<void>(`/life-goals/${id}`, { method: "DELETE" }),
  },
  shortTermGoals: {
    list: (lifeGoalId?: number) =>
      request<ShortTermGoal[]>(
        `/short-term-goals${lifeGoalId ? `?life_goal_id=${lifeGoalId}` : ""}`
      ),
    create: (data: { life_goal_id: number; title: string; summary?: string }) =>
      request<ShortTermGoal>("/short-term-goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<void>(`/short-term-goals/${id}`, { method: "DELETE" }),
  },
  weeklyGoals: {
    list: () => request<WeeklyGoal[]>("/weekly-goals"),
    create: (data: Omit<WeeklyGoal, "id" | "created_at" | "updated_at" | "is_deleted">) =>
      request<WeeklyGoal>("/weekly-goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<void>(`/weekly-goals/${id}`, { method: "DELETE" }),
  },
  coreTasks: {
    list: (taskDate?: string) =>
      request<CoreTask[]>(
        `/core-tasks${taskDate ? `?task_date=${taskDate}` : ""}`
      ),
    create: (data: Partial<CoreTask> & { task_date: string; title: string }) =>
      request<CoreTask>("/core-tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<CoreTask>) =>
      request<CoreTask>(`/core-tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<void>(`/core-tasks/${id}`, { method: "DELETE" }),
  },
  noteTemplates: {
    list: () => request<NoteTemplate[]>("/note-templates"),
    create: (data: { title: string; body: string }) =>
      request<NoteTemplate>("/note-templates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { title?: string; body?: string }) =>
      request<NoteTemplate>(`/note-templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<void>(`/note-templates/${id}`, { method: "DELETE" }),
  },
  quickNotes: {
    list: (noteDate?: string) =>
      request<QuickNote[]>(
        `/quick-notes${noteDate ? `?note_date=${noteDate}` : ""}`
      ),
    create: (body: string, noteDate?: string) =>
      request<QuickNote>("/quick-notes", {
        method: "POST",
        body: JSON.stringify({ body, note_date: noteDate ?? null }),
      }),
    remove: (id: number) =>
      request<void>(`/quick-notes/${id}`, { method: "DELETE" }),
  },
  momentum: {
    current: () => request<MomentumCurrent>("/momentum/current"),
    events: () => request<MomentumEvent[]>("/momentum/events"),
    processInactivity: (localDate?: string) =>
      request<MomentumEvent | null>(
        `/momentum/process-inactivity${localDate ? `?local_date=${localDate}` : ""}`,
        { method: "POST" }
      ),
  },
  weeklyReviews: {
    list: () => request<WeeklyReview[]>("/weekly-reviews"),
    create: (data: Partial<WeeklyReview> & { week_start: string; week_end: string }) =>
      request<WeeklyReview>("/weekly-reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<WeeklyReview>) =>
      request<WeeklyReview>(`/weekly-reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
  settings: {
    get: () => request<AppSettings>("/settings"),
    update: (data: { timezone?: string; week_starts_on?: number }) =>
      request<AppSettings>("/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
  analytics: {
    energy: () => request<{ label: string; count: number }[]>("/analytics/energy"),
    momentumJourney: () =>
      request<
        {
          date: string;
          value: number;
          occurred_at: string;
          event_type: string;
          change: number;
        }[]
      >("/analytics/momentum-journey"),
    dayActivity: (from: string, to: string) =>
      request<{ date: string; status: string }[]>(
        `/analytics/day-activity?from_date=${from}&to_date=${to}`
      ),
    weeklyAnalysis: (month: string) =>
      request<WeeklyAnalysisWeek[]>(
        `/analytics/weekly-analysis?month=${encodeURIComponent(month)}`
      ),
    monthlyAnalysis: (year: string) =>
      request<MonthlyAnalysisMonth[]>(
        `/analytics/monthly-analysis?year=${encodeURIComponent(year)}`
      ),
  },
};
