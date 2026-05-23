import type { DirectionState, WeeklyReview } from "../api/types";

/** Alignment score per weekly review direction (wandering → flowing). */
export const DIRECTION_SCORE: Record<DirectionState, number> = {
  wandering: 0.2,
  struggling: 0.35,
  moving: 0.55,
  grounded: 0.75,
  flowing: 0.95,
};

export function directionScore(state: DirectionState | null | undefined): number {
  if (!state) return 0.5;
  return DIRECTION_SCORE[state] ?? 0.5;
}

/** Average direction alignment from the most recent submitted reviews. */
export function calmFromReviews(
  reviews: Pick<WeeklyReview, "direction_state" | "submitted_at">[],
  recentCount = 4
): number {
  const recent = reviews.filter((r) => r.submitted_at).slice(0, recentCount);
  if (recent.length === 0) return 0.5;
  const sum = recent.reduce((s, r) => s + directionScore(r.direction_state), 0);
  return sum / recent.length;
}
