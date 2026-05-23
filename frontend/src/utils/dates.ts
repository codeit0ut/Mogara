import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import type { WeeklyGoal } from "../api/types";

export function todayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDisplayDate(isoDate: string): string {
  return format(parseISO(isoDate), "EEEE, MMMM d");
}

export function weekBounds(
  date = new Date(),
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
) {
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}

export function isoToDate(iso: string): Date {
  return parseISO(iso.includes("T") ? iso : `${iso}T12:00:00`);
}

export function shiftDate(isoDate: string, days: number): string {
  return format(addDays(parseISO(isoDate), days), "yyyy-MM-dd");
}

/** Week start date (yyyy-MM-dd) shifted by N weeks from a given week start. */
export function shiftWeekStart(
  weekStartDate: string,
  weeks: number,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): string {
  const anchor = addWeeks(isoToDate(weekStartDate), weeks);
  return weekBounds(anchor, weekStartsOn).startDate;
}

/** Calendar date key in local time (avoids UTC midnight mismatches). */
export function dateKeyFromIso(iso: string): string {
  return format(isoToDate(iso), "yyyy-MM-dd");
}

export function weeklyGoalInWeek(
  goal: Pick<WeeklyGoal, "week_start" | "week_end">,
  bounds: { startDate: string; endDate: string }
): boolean {
  const gs = dateKeyFromIso(goal.week_start);
  const ge = dateKeyFromIso(goal.week_end);
  return gs <= bounds.endDate && ge >= bounds.startDate;
}

/** Stable week range for API (date-only bounds, no timezone drift). */
export function weekRangeForApi(bounds: { startDate: string; endDate: string }) {
  return {
    week_start: `${bounds.startDate}T00:00:00`,
    week_end: `${bounds.endDate}T23:59:59`,
  };
}
