const MIN_M = 50;
const MAX_M = 1000;
const GAP_DROP = 3;

export type ThreadPoint = { x: number; y: number; value: number };

export type ThreadSegment = {
  d: string;
  strokeWidth: number;
  gap: boolean;
  opacity: number;
};

function norm(v: number) {
  return Math.max(0, Math.min(1, (v - MIN_M) / (MAX_M - MIN_M)));
}

function widthForValue(v: number) {
  return 3.5 + norm(v) * 11.5;
}

/** Smooth cubic bezier through points (single continuous stroke per segment). */
function pathThrough(points: ThreadPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function lineBetween(a: ThreadPoint, b: ThreadPoint): string {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

export function buildThreadGeometry(
  journey: { value: number; occurred_at?: string }[],
  width = 400,
  height = 160,
  maxPoints = 48
): { segments: ThreadSegment[]; end: ThreadPoint | null; start: ThreadPoint | null } {
  const padX = 36;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (journey.length === 0) {
    const midY = padY + innerH * 0.55;
    const start = { x: padX, y: midY, value: MIN_M + 30 };
    const end = { x: padX + innerW, y: midY - 8, value: MIN_M + 80 };
    return {
      segments: [
        {
          d: lineBetween(start, end),
          strokeWidth: 5,
          gap: false,
          opacity: 0.35,
        },
      ],
      start,
      end,
    };
  }

  const pts =
    journey.length <= maxPoints ? journey : journey.slice(-maxPoints);

  const mapped: ThreadPoint[] = pts.map((p, i) => ({
    x: padX + (i / Math.max(1, pts.length - 1)) * innerW,
    y: padY + (1 - norm(p.value)) * innerH,
    value: p.value,
  }));

  const segments: ThreadSegment[] = [];
  let run: ThreadPoint[] = [mapped[0]];

  for (let i = 1; i < mapped.length; i++) {
    const drop = mapped[i].value - mapped[i - 1].value;
    if (drop <= -GAP_DROP) {
      if (run.length >= 1) {
        const avg = run.reduce((s, p) => s + p.value, 0) / run.length;
        segments.push({
          d: pathThrough(run),
          strokeWidth: widthForValue(avg),
          gap: false,
          opacity: Math.max(0.45, 0.55 + norm(avg) * 0.45),
        });
      }
      segments.push({
        d: lineBetween(mapped[i - 1], mapped[i]),
        strokeWidth: 2,
        gap: true,
        opacity: 0.28,
      });
      run = [mapped[i]];
    } else {
      run.push(mapped[i]);
    }
  }

  if (run.length >= 1) {
    const avg = run.reduce((s, p) => s + p.value, 0) / run.length;
    segments.push({
      d: pathThrough(run),
      strokeWidth: widthForValue(avg),
      gap: false,
      opacity: Math.max(0.5, 0.6 + norm(avg) * 0.4),
    });
  }

  return {
    segments,
    start: mapped[0] ?? null,
    end: mapped[mapped.length - 1] ?? null,
  };
}
