import type { MomentumCurrent } from "../api/types";

export type TrendLabel =
  | "Rising"
  | "Falling"
  | "Accelerating"
  | "Slowing"
  | "Recovering"
  | "Flat";

export type MomentumTrendFields = {
  mood: string;
  pct: number;
  weekDelta: number;
  detail: string;
  trend: TrendLabel;
  pace: TrendLabel | "—";
  sparkValues: number[];
};

function moodFromPct(pct: number): string {
  if (pct >= 0.85) return "Flowing";
  if (pct >= 0.65) return "Strong";
  if (pct >= 0.45) return "Steady";
  if (pct >= 0.25) return "Building";
  return "Quiet";
}

function slope(values: number[]): number {
  if (values.length < 2) return 0;
  return values[values.length - 1] - values[0];
}

function analyzeMovement(values: number[]): { trend: TrendLabel; pace: TrendLabel | "—" } {
  if (values.length < 2) {
    return { trend: "Flat", pace: "—" };
  }

  const overall = slope(values);
  const mid = Math.max(1, Math.floor(values.length / 2));
  const early = values.slice(0, mid);
  const late = values.slice(mid - 1);

  const earlySlope = slope(early);
  const lateSlope = slope(late);

  let trend: TrendLabel = "Flat";
  if (overall > 8) trend = "Rising";
  else if (overall < -8) trend = "Falling";
  else if (overall > 2) trend = "Rising";
  else if (overall < -2) trend = "Falling";

  let pace: TrendLabel | "—" = "—";
  if (values.length >= 4) {
    if (lateSlope > 0 && lateSlope < earlySlope - 2) pace = "Slowing";
    else if (lateSlope > earlySlope + 2 && lateSlope > 0) pace = "Accelerating";
    else if (overall < 0 && lateSlope > 2) pace = "Recovering";
    else if (Math.abs(lateSlope) <= 2 && Math.abs(overall) <= 4) pace = "Flat";
    else if (lateSlope < -2 && lateSlope < earlySlope) pace = "Falling";
    else if (lateSlope > 2) pace = "Rising";
  }

  if (trend === "Flat" && pace === "Rising") trend = "Rising";
  if (trend === "Flat" && pace === "Falling") trend = "Falling";
  if (trend === "Falling" && pace === "Recovering") trend = "Recovering";

  return { trend, pace };
}

/** Last N journey points for sparkline + field labels */
export function buildMomentumTrend(
  current: MomentumCurrent,
  journey: { value: number }[],
  weekDelta: number,
  window = 14
): MomentumTrendFields {
  const range = current.max - current.min;
  const pct = Math.round(((current.value - current.min) / range) * 100);
  const mood = moodFromPct(pct / 100);

  let series = journey.map((p) => p.value);
  if (series.length === 0) {
    series = [current.start, current.value];
  } else if (series[series.length - 1] !== current.value) {
    series = [...series, current.value];
  }

  const sparkValues = series.slice(-window);
  const { trend, pace } = analyzeMovement(sparkValues);

  const deltaPhrase =
    weekDelta > 0
      ? `+${weekDelta} this week`
      : weekDelta < 0
        ? `${weekDelta} this week`
        : "Flat this week";

  const vsStart = current.value - current.start;
  const detail = `${deltaPhrase} · ${vsStart >= 0 ? "+" : ""}${vsStart} since start`;

  return { mood, pct, weekDelta, detail, trend, pace, sparkValues };
}
