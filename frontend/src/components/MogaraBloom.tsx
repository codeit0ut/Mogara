import { MogaraFlowerSvg } from "./mogara/MogaraFlowerSvg";

type MogaraBloomProps = {
  className?: string;
  size?: number;
  animate?: boolean;
};

/** Jasmine bloom — cream petals, gold heart, leaf greens (reference mogara assets) */
export function MogaraBloom({ className = "", size = 32, animate = false }: MogaraBloomProps) {
  const anim = animate
    ? "animate-[bloom-glow_var(--duration-bloom)_ease-in-out_infinite]"
    : "";

  return (
    <MogaraFlowerSvg
      bloom={1}
      size={size}
      className={anim + " " + className}
    />
  );
}
