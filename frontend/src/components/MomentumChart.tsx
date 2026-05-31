import { useId } from "react";
import { EMPTY_HINTS } from "../copy/hints";
import { ChartPlotArea, EmptyState } from "./ui";

const ABS_MIN = 50;
const ABS_MAX = 1000;
const W = 400;
const H = 200;

function chartScale(points: { value: number }[], autoScale: boolean) {
  if (!autoScale) {
    return { min: ABS_MIN, max: ABS_MAX };
  }
  const values = points.map((p) => p.value);
  let min = Math.min(...values, 0);
  let max = Math.max(...values, 0);
  if (min === max) {
    min -= 5;
    max += 5;
  } else {
    const pad = Math.max(1, Math.round((max - min) * 0.12));
    min -= pad;
    max += pad;
  }
  return { min, max };
}

export function MomentumChart({
  points,
  compact = false,
  autoScale = false,
}: {
  points: { value: number; occurred_at?: string }[];
  compact?: boolean;
  autoScale?: boolean;
}) {
  const gradId = useId();

  if (points.length < 2) {
    return (
      <ChartPlotArea>
        <EmptyState
          compact
          title="No journey data in this range"
          hint={EMPTY_HINTS.noJourney}
        />
      </ChartPlotArea>
    );
  }

  const { min, max } = chartScale(points, autoScale);
  const span = max - min || 1;

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p.value - min) / span) * H;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M0,${H} L${coords.split(" ").join(" L")} L${W},${H} Z`;

  return (
    <ChartPlotArea>
      <div
        className={`flex h-full flex-col rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-white-paper)] p-3 ${
          compact
            ? "min-h-[9.5rem] sm:min-h-[10.5rem] lg:min-h-[11.5rem]"
            : "min-h-[13.5rem] sm:min-h-[14.5rem] lg:min-h-[15.5rem]"
        }`}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={`h-full w-full flex-1 ${
            compact ? "min-h-[8rem]" : "min-h-[12rem]"
          }`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-momentum-line)" />
              <stop offset="100%" stopColor="var(--color-momentum-peak)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="var(--color-momentum-fill)" />
          <polyline
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={coords}
          />
        </svg>
      </div>
    </ChartPlotArea>
  );
}
