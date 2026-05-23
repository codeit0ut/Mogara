import { EMPTY_HINTS } from "../copy/hints";
import { ChartPlotArea, EmptyState } from "./ui";

const BAR_COLORS = [
  "var(--color-blue)",
  "var(--color-primary)",
  "var(--color-violet)",
  "var(--color-green)",
  "var(--color-walk-glow)",
];

export function EnergyChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return (
      <ChartPlotArea>
        <EmptyState
          compact
          title="No energy data"
          hint={EMPTY_HINTS.noEnergy}
        />
      </ChartPlotArea>
    );
  }

  return (
    <ChartPlotArea>
      <ul className="flex w-full flex-col justify-center space-y-3 py-1">
        {data.map(({ label, count }, i) => (
          <li key={label}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium text-[var(--color-ink-secondary)]">{label}</span>
              <span className="tabular-nums text-[var(--color-ink-caption)]">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-momentum-low)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(count / max) * 100}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ChartPlotArea>
  );
}
