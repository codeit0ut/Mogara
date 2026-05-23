import { useId } from "react";
import { FLOWER_CENTER, MOGARA_PETALS, petalPose } from "./petals";

const { x: CX, y: CY } = FLOWER_CENTER;

type MogaraFlowerSvgProps = {
  bloom: number;
  /** Recent weekly direction alignment 0–1 — warms the gold heart */
  calm?: number;
  size?: number;
  className?: string;
  /** Highlight ring when hovering a life goal on the dashboard */
  activeGoalColor?: string | null;
};

/**
 * Canonical Mogara jasmine — native SVG transforms only (no CSS transform on &lt;g&gt;).
 * Cream layered petals, soft gold heart, leaf base.
 */
export function MogaraFlowerSvg({
  bloom,
  calm = 0.5,
  size = 48,
  className = "",
  activeGoalColor = null,
}: MogaraFlowerSvgProps) {
  const uid = useId().replace(/:/g, "");
  const b = Math.max(0, Math.min(1, bloom));
  const c = Math.max(0, Math.min(1, calm));
  const aligned = c > 0.7;
  const auraR = 11 + b * 3;
  const auraOp = (aligned ? 0.42 : 0.32) + b * (aligned ? 0.48 : 0.38);
  const coreR = 3.2 + b * 2.8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${uid}-core`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="var(--color-primary-bright)" />
          <stop offset="55%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-deep)" />
        </radialGradient>
        <radialGradient id={`${uid}-petal`} cx="50%" cy="28%" r="75%">
          <stop offset="0%" stopColor="var(--color-white-paper)" />
          <stop offset="55%" stopColor="var(--color-white-petal)" />
          <stop offset="100%" stopColor="var(--color-white-cream)" />
        </radialGradient>
      </defs>

      {/* Leaves */}
      <g fill="var(--color-green-deep)" opacity={0.9}>
        <ellipse cx="14" cy="38" rx="9" ry="5" transform="rotate(-28 14 38)" />
        <ellipse cx="34" cy="37" rx="8" ry="4.5" transform="rotate(22 34 37)" />
        <ellipse cx="24" cy="40" rx="7" ry="4" />
      </g>
      <g fill="none" stroke="var(--color-green-vein)" strokeWidth="0.55" opacity={0.72}>
        <path d="M10 38 Q14 34 18 36" />
        <path d="M30 36 Q34 33 38 37" />
        <path d="M22 40 L24 35" />
      </g>

      {/* Warm glow behind bloom */}
      <circle
        cx={CX}
        cy={CY}
        r={auraR}
        fill={aligned ? "var(--color-primary-muted)" : "var(--color-logo-gold)"}
        opacity={auraOp}
      />

      {/* Petals — back to front */}
      {MOGARA_PETALS.map((p, i) => {
        const pose = petalPose(p, b);
        const petalOp = 0.78 + b * 0.2 - i * 0.008;
        return (
          <g
            key={i}
            transform={`rotate(${pose.rot.toFixed(2)} ${pose.cx} ${pose.cy})`}
          >
            <ellipse
              cx={pose.cx}
              cy={pose.cy}
              rx={pose.rx}
              ry={pose.ry}
              fill={`url(#${uid}-petal)`}
              stroke="var(--color-white-silver)"
              strokeWidth={0.4}
              opacity={petalOp}
            />
            <ellipse
              cx={pose.cx}
              cy={pose.cy + 0.7}
              rx={pose.rx * 0.48}
              ry={pose.ry * 0.62}
              fill="var(--color-white-paper)"
              opacity={0.55 + b * 0.35}
            />
            <line
              x1={pose.cx}
              y1={pose.cy - pose.ry * 0.48}
              x2={pose.cx}
              y2={pose.cy + pose.ry * 0.38}
              stroke="var(--color-white-veil)"
              strokeWidth={0.32}
              opacity={0.25 + b * 0.35}
            />
          </g>
        );
      })}

      {/* Gold heart — soft disc, no spoke lines */}
      <circle
        cx={CX}
        cy={CY}
        r={coreR}
        fill={aligned ? `url(#${uid}-core)` : "var(--color-primary-deep)"}
        opacity={aligned ? 0.92 : 0.82}
      />
      {b > 0.55 && (
        <circle
          cx={CX}
          cy={CY}
          r={coreR * 0.55}
          fill="var(--color-primary-bright)"
          opacity={(b - 0.55) * 1.8}
        />
      )}
      <circle
        cx={CX}
        cy={CY}
        r={1 + b * 1.6}
        fill="var(--color-white-paper)"
        opacity={0.35 + b * 0.45}
      />

      {activeGoalColor && b > 0.35 && (
        <circle
          cx={CX}
          cy={CY}
          r={auraR + 2}
          fill="none"
          stroke={activeGoalColor}
          strokeWidth={1.2}
          opacity={0.55 + b * 0.3}
        />
      )}
    </svg>
  );
}
