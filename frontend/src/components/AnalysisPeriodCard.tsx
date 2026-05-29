import type { MomentumPoint } from "../api/types";
import { MomentumChart } from "./MomentumChart";
import { Badge } from "./ui";

function deltaTone(delta: number): "success" | "warning" | "neutral" {
  if (delta > 0) return "success";
  if (delta < 0) return "warning";
  return "neutral";
}

function deltaLabel(delta: number) {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function AnalysisPeriodCard({
  title,
  momentumDelta,
  tasksSet,
  tasksCompleted,
  momentumPoints,
}: {
  title: string;
  momentumDelta: number;
  tasksSet: number;
  tasksCompleted: number;
  momentumPoints: MomentumPoint[];
}) {
  return (
    <li className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-white-paper)] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={deltaTone(momentumDelta)} dot>
            Momentum {deltaLabel(momentumDelta)}
          </Badge>
          <Badge tone="neutral">Tasks set {tasksSet}</Badge>
          <Badge tone="neutral">Completed {tasksCompleted}</Badge>
        </div>
      </div>
      <MomentumChart points={momentumPoints} compact />
    </li>
  );
}
