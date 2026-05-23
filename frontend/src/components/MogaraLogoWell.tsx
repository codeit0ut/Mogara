import { MogaraBloom } from "./MogaraBloom";

export function MogaraLogoWell({
  size = 36,
  animate = false,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  const pad = Math.max(4, Math.round(size * 0.15));
  const bloom = size - pad * 2;
  return (
    <div
      className={`mogara-logo-well shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <MogaraBloom size={bloom} animate={animate} />
    </div>
  );
}
