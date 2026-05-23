import { useCallback, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MOGARA_BRAND } from "../copy/brand";

const CARD_OFFSET_X = 14;

export function MogaraBrandHint({ children }: { children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + CARD_OFFSET_X,
    });
  }, []);

  const show = () => {
    updatePosition();
    setOpen(true);
  };

  const hide = () => setOpen(false);

  return (
    <>
      <div
        ref={anchorRef}
        className="relative inline-flex shrink-0 rounded-[var(--radius-md)] outline-none ring-[var(--color-primary)] transition-shadow focus-visible:ring-2"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={open ? "mogara-brand-hint" : undefined}
      >
        {children}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                id="mogara-brand-hint"
                role="tooltip"
                className="pointer-events-none fixed z-[300] w-[min(17.5rem,calc(100vw-4rem))]"
                style={{
                  top: coords.top,
                  left: coords.left,
                  transform: "translateY(-50%)",
                }}
                initial={{ opacity: 0, x: -10, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-green)] bg-[linear-gradient(145deg,var(--color-white-paper)_0%,var(--color-white-cream)_55%,var(--color-green-muted)_100%)] p-4 shadow-[var(--shadow-panel),0_0_28px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--color-primary-muted)] opacity-60 blur-2xl"
                    aria-hidden
                  />

                  <p className="relative text-[9px] font-semibold tracking-[0.22em] text-[var(--color-green-bright)]">
                    {MOGARA_BRAND.name.toUpperCase()}
                  </p>

                  <p className="relative mt-1.5 font-display text-lg font-semibold leading-tight">
                    <span className="bg-gradient-to-br from-[var(--color-ink)] via-[var(--color-primary-deep)] to-[var(--color-green-bright)] bg-clip-text text-transparent">
                      {MOGARA_BRAND.tagline}
                    </span>
                  </p>

                  <p className="relative mt-2.5 text-[13px] leading-relaxed text-[var(--color-ink-secondary)]">
                    {MOGARA_BRAND.about}
                  </p>

                  <p className="relative mt-3 border-t border-[var(--color-border)]/70 pt-2.5 text-[11px] italic text-[var(--color-primary-deep)]">
                    {MOGARA_BRAND.whisper}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
