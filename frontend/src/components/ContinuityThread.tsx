import { useMemo } from "react";
import { buildThreadGeometry } from "../utils/threadPath";

type ContinuityThreadProps = {
  journey?: { value: number; occurred_at?: string }[];
  momentum?: number;
  calm?: number;
};

const W = 440;
const H = 176;

export function ContinuityThread({
  journey = [],
  momentum = 100,
  calm = 0.5,
}: ContinuityThreadProps) {
  const { segments, end, start } = useMemo(
    () => buildThreadGeometry(journey, W, H),
    [journey]
  );

  const endRadius = 5 + ((momentum - 50) / 950) * 7;
  const threadTone = calm > 0.7 ? "var(--color-primary)" : "var(--color-primary-deep)";

  return (
    <div
      className="mogara-panel mogara-panel-highlight relative overflow-hidden"
      role="img"
      aria-label="Continuity thread — one line across your momentum journey"
    >
      {/* Inset frame */}
      <div className="pointer-events-none absolute inset-2 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]" />

      {/* Heavy grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative px-5 pb-4 pt-5">
        <div className="mb-4 flex items-end justify-between border-b border-[var(--color-border)] pb-3">
          <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--color-green-bright)]">
          CONTINUITY
        </p>
        <p className="mt-1 text-sm font-semibold text-white-bloom">Single thread</p>
          </div>
          <p className="max-w-[10rem] text-right text-ui-caption text-[11px] leading-snug">
            Thick where momentum held · broken where it slipped
          </p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minHeight: "11rem" }}
          aria-hidden
        >
          <defs>
            <filter id="thread-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
            </filter>
            <linearGradient id="thread-fill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-momentum-low)" />
              <stop offset="55%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-momentum-peak)" />
            </linearGradient>
          </defs>

          {/* Underlay — weight shadow thread */}
          {segments.map((seg, i) =>
            !seg.gap ? (
              <path
                key={`under-${i}`}
                d={seg.d}
                fill="none"
                stroke="var(--color-white-milk)"
                strokeWidth={seg.strokeWidth + 5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={seg.opacity * 0.9}
              />
            ) : null
          )}

          {/* Gap threads — faint dashed */}
          {segments.map((seg, i) =>
            seg.gap ? (
              <path
                key={`gap-${i}`}
                d={seg.d}
                fill="none"
                stroke="var(--color-ink-faint)"
                strokeWidth={seg.strokeWidth}
                strokeDasharray="3 9"
                strokeLinecap="round"
                opacity={seg.opacity}
              />
            ) : null
          )}

          {/* Main solid thread */}
          {segments.map((seg, i) =>
            !seg.gap ? (
              <path
                key={`main-${i}`}
                d={seg.d}
                fill="none"
                stroke="url(#thread-fill)"
                strokeWidth={seg.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={seg.opacity}
                filter="url(#thread-shadow)"
              />
            ) : null
          )}

          {/* Start tail — worn end */}
          {start && (
            <circle
              cx={start.x}
              cy={start.y}
              r={3}
              fill="var(--color-border)"
              stroke="var(--color-ink-faint)"
              strokeWidth={1}
              opacity={0.6}
            />
          )}

          {/* Now — heavy knot */}
          {end && (
            <>
              <circle
                cx={end.x}
                cy={end.y}
                r={endRadius + 4}
                fill="var(--color-primary)"
                opacity={0.12}
              />
              <circle
                cx={end.x}
                cy={end.y}
                r={endRadius}
                fill={threadTone}
                stroke="var(--color-white-milk)"
                strokeWidth={2.5}
                filter="url(#thread-shadow)"
              />
              <circle
                cx={end.x}
                cy={end.y}
                r={Math.max(2, endRadius * 0.35)}
                fill="var(--color-white-paper)"
                opacity={0.5}
              />
            </>
          )}

        </svg>

        <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)]/80 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
          <span>Earlier</span>
          <span className="text-[var(--color-ink-caption)] normal-case tracking-normal">
            one line · no levels
          </span>
          <span className="text-[var(--color-primary-deep)]">Now</span>
        </div>
      </div>
    </div>
  );
}
