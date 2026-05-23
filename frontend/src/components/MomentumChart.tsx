import { EMPTY_HINTS } from "../copy/hints";
import { ChartPlotArea, EmptyState } from "./ui";

const MIN = 50;
const MAX = 1000;
const W = 400;
const H = 200;

export function MomentumChart({
  points,
}: {
  points: { value: number; occurred_at?: string }[];
}) {
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

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p.value - MIN) / (MAX - MIN)) * H;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M0,${H} L${coords.split(" ").join(" L")} L${W},${H} Z`;

  return (
    <ChartPlotArea>
      <div className="flex h-full min-h-[13.5rem] flex-col rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-white-paper)] p-3 sm:min-h-[14.5rem] lg:min-h-[15.5rem]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full min-h-[12rem] w-full flex-1"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="momentum-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-momentum-line)" />
              <stop offset="100%" stopColor="var(--color-momentum-peak)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="var(--color-momentum-fill)" />
          <polyline
            fill="none"
            stroke="url(#momentum-line)"
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
