const RANGE_DAYS: Record<string, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

export const MOMENTUM_RANGE_OPTIONS = [
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
  { value: "90D", label: "90D" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "All" },
] as const;

export type ChartRange = (typeof MOMENTUM_RANGE_OPTIONS)[number]["value"];

export function filterPointsByRange<T extends { occurred_at?: string | null }>(
  points: T[],
  range: string
): T[] {
  if (range === "ALL") return points;
  const days = RANGE_DAYS[range] ?? 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return points.filter((p) => {
    if (!p.occurred_at) return true;
    return new Date(p.occurred_at).getTime() >= cutoff;
  });
}
