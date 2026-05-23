import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

export type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS: Record<ToastType, number> = {
  success: 3200,
  error: 5500,
  info: 4000,
};

const styles: Record<ToastType, string> = {
  success:
    "border-[color-mix(in_srgb,var(--color-green)_45%,var(--color-border))] bg-[var(--color-green-muted)]",
  error:
    "border-[color-mix(in_srgb,var(--color-red)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-red)_8%,var(--color-white-paper))]",
  info: "border-[color-mix(in_srgb,var(--color-primary)_40%,var(--color-border))] bg-[var(--color-primary-muted)]",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-[var(--color-green)]",
  error: "text-[var(--color-red)]",
  info: "text-[var(--color-primary-deep)]",
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            role="alert"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-[var(--radius-lg)] border px-3.5 py-3 shadow-[var(--shadow-panel)] ${styles[t.type]}`}
          >
            <span className={iconStyles[t.type]}>
              <ToastIcon type={t.type} />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-snug text-[var(--color-ink)]">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-[var(--color-ink-disabled)] transition-colors hover:text-[var(--color-ink-secondary)]"
              aria-label="Dismiss"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS[type]);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
