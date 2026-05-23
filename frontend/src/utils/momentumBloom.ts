import { calmFromReviews } from "./directionCalm";
import type { WeeklyReview } from "../api/types";

export const MOMENTUM_MIN = 50;
export const MOMENTUM_MAX = 1000;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** 0 = closed bud at floor, 1 = full bloom at ceiling (momentum only) */
export function momentumToBloom(momentum: number): number {
  return clamp01((momentum - MOMENTUM_MIN) / (MOMENTUM_MAX - MOMENTUM_MIN));
}

/**
 * Living bloom openness — rhythm (momentum) + alignment (recent weekly directions).
 * Same weighting used on the dashboard before the thread visualization.
 */
export function computeBloomFactor(
  momentum: number,
  calm: number
): number {
  const rhythm = momentumToBloom(momentum);
  return clamp01(rhythm * 0.65 + calm * 0.35);
}

export function computeBloomFromReviews(
  momentum: number,
  reviews: Pick<WeeklyReview, "direction_state" | "submitted_at">[]
): { bloom: number; calm: number } {
  const calm = calmFromReviews(reviews);
  return { bloom: computeBloomFactor(momentum, calm), calm };
}

export function bloomToMomentum(bloom: number): number {
  const b = Math.max(0, Math.min(1, bloom));
  return Math.round(MOMENTUM_MIN + b * (MOMENTUM_MAX - MOMENTUM_MIN));
}

export function bloomLabelFromFactor(bloom: number): string {
  if (bloom < 0.2) return "Tight bud";
  if (bloom < 0.45) return "Opening";
  if (bloom < 0.7) return "Blooming";
  return "In full bloom";
}

export function bloomLabel(momentum: number): string {
  return bloomLabelFromFactor(momentumToBloom(momentum));
}
