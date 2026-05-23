import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { bloomLabelFromFactor, computeBloomFactor } from "../utils/momentumBloom";
import { getLifeGoalColor } from "../utils/goalColors";
import { MogaraFlowerSvg } from "./mogara/MogaraFlowerSvg";
import { Button } from "./ui";

type MogaraBloomMomentumProps = {
  momentum: number;
  /** 0–1 from recent weekly review direction states (default 0.5) */
  calm?: number;
  /** Latest direction label for caption, e.g. "flowing" */
  latestDirection?: string | null;
  size?: number;
  activeGoalId?: number | null;
};

export function MogaraBloomMomentum({
  momentum,
  calm = 0.5,
  latestDirection = null,
  size = 240,
  activeGoalId = null,
}: MogaraBloomMomentumProps) {
  const reduced = useReducedMotion() ?? false;
  const actualBloom = useMemo(
    () => computeBloomFactor(momentum, calm),
    [momentum, calm]
  );
  const [previewBloom, setPreviewBloom] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bloom = previewBloom ?? actualBloom;
  const isPreviewing = previewBloom !== null;
  const label = bloomLabelFromFactor(bloom);
  const activeColor = activeGoalId ? getLifeGoalColor(activeGoalId) : null;

  useEffect(() => {
    return () => {
      animRef.current?.stop();
      if (holdRef.current) clearTimeout(holdRef.current);
    };
  }, []);

  const runPreview = useCallback(() => {
    if (isPreviewing) return;
    animRef.current?.stop();
    if (holdRef.current) clearTimeout(holdRef.current);

    const from = actualBloom;
    setPreviewBloom(from);

    const openDuration = reduced ? 0.65 : 2.6;
    const closeDuration = reduced ? 0.5 : 1.5;
    const holdMs = reduced ? 400 : 1400;

    animRef.current = animate(from, 1, {
      duration: openDuration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setPreviewBloom(v),
      onComplete: () => {
        holdRef.current = setTimeout(() => {
          animRef.current = animate(1, actualBloom, {
            duration: closeDuration,
            ease: [0.4, 0, 0.2, 1],
            onUpdate: (v) => setPreviewBloom(v),
            onComplete: () => setPreviewBloom(null),
          });
        }, holdMs);
      },
    });
  }, [actualBloom, isPreviewing, reduced]);

  return (
    <div
      className="mogara-panel mogara-panel-highlight relative overflow-hidden"
      role="img"
      aria-label={`Mogara bloom at ${momentum} momentum — ${label}`}
    >
      <div className="pointer-events-none absolute inset-2 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]" />

      <div className="relative px-5 pb-4 pt-5">
        <div className="mb-3 flex items-end justify-between border-b border-[var(--color-border)] pb-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--color-green-bright)]">
              MOGARA
            </p>
            <p className="mt-1 text-sm font-semibold text-white-bloom">Living bloom</p>
          </div>
          <p className="max-w-[11rem] text-right text-ui-caption text-[11px] leading-snug">
            Momentum and weekly rhythm shape the bloom
          </p>
        </div>

        <div className="flex flex-col items-center py-2">
          <div
            className="mogara-logo-well relative flex items-center justify-center rounded-2xl p-3"
            style={{ width: size + 32, height: size + 32 }}
          >
            <MogaraFlowerSvg
              bloom={bloom}
              calm={calm}
              size={size}
              activeGoalColor={activeColor?.solid ?? null}
            />
          </div>

          <div className="mt-4 flex w-full max-w-xs items-center justify-between gap-3 text-[10px]">
            <span className="text-ui-label">Bud</span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-white-milk)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-green-vein)] via-[var(--color-primary)] to-[var(--color-primary-hover)]"
                initial={reduced ? false : { width: "0%" }}
                animate={{ width: `${Math.round(bloom * 100)}%` }}
                transition={
                  isPreviewing
                    ? { duration: 0.12, ease: "easeOut" }
                    : { type: "spring", stiffness: 35, damping: 16, delay: 0.15 }
                }
              />
            </div>
            <span className="text-ui-label">Full</span>
          </div>

          <p className="mt-2 text-center text-ui-caption text-[11px]">
            <span className="font-semibold tabular-nums text-gold">{momentum}</span>
            <span className="text-[var(--color-ink-muted)]"> momentum</span>
            {latestDirection && (
              <>
                <span className="text-[var(--color-ink-muted)]"> · </span>
                <span className="capitalize text-[var(--color-green-bright)]">
                  {latestDirection}
                </span>
              </>
            )}
            <span className="text-[var(--color-ink-muted)]"> · </span>
            <span className="text-[var(--color-ink-secondary)]">{label}</span>
            {isPreviewing && (
              <span className="text-[var(--color-ink-faint)]"> · preview</span>
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={runPreview}
            disabled={isPreviewing}
            aria-busy={isPreviewing}
          >
            {isPreviewing ? "Blooming…" : "Preview full bloom"}
          </Button>
        </div>
      </div>
    </div>
  );
}
