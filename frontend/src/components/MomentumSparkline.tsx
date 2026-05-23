import type { TrendLabel } from "../utils/momentumTrend";

const TREND_COLOR: Record<TrendLabel, string> = {
  Rising: "var(--color-green-bright)",
  Falling: "var(--color-red)",
  Accelerating: "var(--color-primary-bright)",
  Slowing: "var(--color-amber)",
  Recovering: "var(--color-blue)",
  Flat: "var(--color-ink-caption)",
};

const VIEW_W = 100;

export function MomentumSparkline({
  values,
  trend,
  width,
  height = 28,
  className = "",
}: {
  values: number[];
  trend: TrendLabel;
  /** Fixed pixel width; omit to stretch with container (`w-full`). */
  width?: number;
  height?: number;
  className?: string;
}) {
  const pad = 2;
  const w = VIEW_W;
  const h = height;
  const svgClass = width
    ? `shrink-0 ${className}`
    : `h-5 w-full min-h-[20px] max-h-5 ${className}`;

  if (values.length < 2) {
    const y = h / 2;
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={width}
        height={height}
        preserveAspectRatio="none"
        className={svgClass}
        aria-hidden
      >
        <line
          x1={pad}
          y1={y}
          x2={w - pad}
          y2={y}
          stroke={TREND_COLOR[trend]}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });

  const line = coords.join(" ");
  const area = `M${pad},${h - pad} L${coords.join(" L")} L${w - pad},${h - pad} Z`;
  const stroke = TREND_COLOR[trend];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={svgClass}
      aria-hidden
    >
      <path d={area} fill={stroke} fillOpacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrendField({
  label,
  value,
  tone = "neutral",
  className = "",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "up" | "down" | "warm" | "accent";
  className?: string;
}) {
  const tones = {
    neutral: "text-[var(--color-ink-caption)]",
    up: "text-[var(--color-green)]",
    down: "text-[var(--color-red)]",
    warm: "text-[var(--color-amber)]",
    accent: "text-[var(--color-primary-bright)]",
  };
  return (
    <div className={`flex shrink-0 flex-col gap-px ${className}`}>
      <span className="text-[9px] font-medium uppercase tracking-wide text-[var(--color-ink-caption)]">
        {label}
      </span>
      <span className={`whitespace-nowrap text-[11px] font-semibold leading-tight ${tones[tone]}`}>
        {value}
      </span>
    </div>
  );
}

export function trendTone(t: TrendLabel): "up" | "down" | "warm" | "accent" | "neutral" {
  switch (t) {
    case "Rising":
    case "Accelerating":
    case "Recovering":
      return "up";
    case "Falling":
      return "down";
    case "Slowing":
      return "warm";
    case "Flat":
      return "neutral";
    default:
      return "accent";
  }
}
