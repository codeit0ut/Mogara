import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { IconExternal } from "./icons";

/* ─── Layout primitives ─── */

export function Panel({
  children,
  className = "",
  padding = true,
  highlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  highlight?: boolean;
}) {
  return (
    <section
      className={`mogara-panel ${highlight ? "mogara-panel-highlight" : ""} ${
        padding ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

/** @deprecated use Panel */
export const Card = Panel;

/** Carbon-style page title block */
export function ContentHeader({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-green)] bg-[var(--color-green-muted)] text-[var(--color-primary-deep)]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-white-bloom">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return <ContentHeader title={title} subtitle={subtitle}>{children}</ContentHeader>;
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filter,
  actions,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filter?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-white-cream)_3%,var(--color-surface))] px-4 py-3 sm:flex-row sm:items-center">
      {onSearchChange !== undefined && (
        <input
          type="search"
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white-paper)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-placeholder)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-focus-ring)] sm:flex-1"
        />
      )}
      <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
        {filter}
        {actions}
      </div>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-white-paper)_2%,var(--color-surface-elevated))] px-4 py-2.5 text-ui-label text-[11px] sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
      {columns.map((col, i) => (
        <span key={col} className={i === columns.length - 1 ? "text-right" : ""}>
          {col}
        </span>
      ))}
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
  action,
  className = "",
}: {
  children: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0 flex-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <span
            className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-green-vein)]"
            aria-hidden
          />
          {children}
        </h2>
        {hint && (
          <p className="mt-1 pl-2.5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
            {hint}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
  onView,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "green" | "violet";
  onView?: () => void;
}) {
  const iconBg =
    accent === "green"
      ? "bg-[var(--color-green-muted)] text-[var(--color-green)]"
      : accent === "violet"
        ? "bg-[color-mix(in_srgb,var(--color-violet)_20%,transparent)] text-[var(--color-violet)]"
        : "bg-[var(--color-primary-muted)] text-[var(--color-primary-deep)]";

  const cardAccent =
    accent === "green"
      ? "border-l-2 border-l-[var(--color-green)]"
      : accent === "violet"
        ? "border-l-2 border-l-[var(--color-violet)]"
        : "border-l-2 border-l-[var(--color-primary)]";

  return (
    <div
      className={`mogara-panel p-4 ${cardAccent} ${
        accent === "green" ? "shadow-[var(--shadow-green)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] ${iconBg}`}>
          <span className="text-xs font-bold opacity-80">●</span>
        </div>
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-hover-surface)] hover:text-[var(--color-ink-secondary)]"
          >
            View <IconExternal />
          </button>
        )}
      </div>
      <p className="mt-3 text-ui-label text-[11px]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white-bloom">{value}</p>
      {hint && <p className="mt-1 text-ui-caption text-xs">{hint}</p>}
    </div>
  );
}

export function TimeRangePills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-cream)] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-[var(--color-primary-deep)] text-[var(--color-on-accent)]"
              : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-secondary)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Muted({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm leading-relaxed text-[var(--color-ink-secondary)] ${className}`}>
      {children}
    </p>
  );
}

/** Fixed minimum height so dashboard chart panels stay balanced empty or filled */
export function ChartPlotArea({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[13.5rem] w-full flex-col justify-center sm:min-h-[14.5rem] lg:min-h-[15.5rem] ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  compact = false,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-green)] bg-[color-mix(in_srgb,var(--color-white-cream)_4%,var(--color-surface))] px-6 text-center ${
        compact ? "py-8" : "py-12"
      }`}
    >
      <p className="text-sm font-medium text-[var(--color-ink-secondary)]">{title}</p>
      {hint && <p className="mt-2 text-ui-caption text-xs">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const fieldClass =
  "box-border w-full h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white-paper)] px-3 text-sm leading-normal text-[var(--color-ink)] outline-none transition-[border-color,box-shadow,background] duration-300 placeholder:text-[var(--color-ink-placeholder)] hover:border-[var(--color-border-green)] hover:bg-[var(--color-white-petal)] focus:border-[var(--color-border-focus)] focus:bg-[var(--color-white-paper)] focus:ring-2 focus:ring-[var(--color-focus-ring)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea(props, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`${fieldClass} resize-y py-2.5 leading-relaxed ${props.className ?? ""}`}
      />
    );
  }
);

export function Button({
  variant = "soft",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "soft" | "ghost" | "primary" | "outline" | "danger";
  size?: "sm" | "md";
}) {
  const sizes = {
    sm: "h-8 px-2.5 text-xs",
    md: "h-9 px-3.5 text-sm",
  };
  const styles = {
    soft: "bg-[var(--color-white-cream)] text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-border-green)] hover:bg-[var(--color-hover-surface)]",
    ghost: "text-[var(--color-ink-secondary)] hover:bg-[var(--color-hover-surface)] hover:text-[var(--color-ink)]",
    primary:
      "bg-[var(--color-primary-hover)] text-[var(--color-on-accent)] font-semibold border border-[color-mix(in_srgb,var(--color-primary-hover)_80%,#5c4510)] hover:bg-[var(--color-primary-deep)] shadow-[var(--shadow-glow)]",
    outline:
      "border border-[var(--color-border)] bg-transparent text-[var(--color-ink-secondary)] hover:border-[var(--color-ink-faint)] hover:bg-[var(--color-hover-surface)] hover:text-[var(--color-ink)]",
    danger:
      "bg-[color-mix(in_srgb,var(--color-red)_15%,var(--color-surface))] text-[var(--color-red)] border border-[color-mix(in_srgb,var(--color-red)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-red)_25%,var(--color-surface))]",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] font-medium transition-all duration-300 ease-[var(--ease-mogara)] disabled:pointer-events-none disabled:opacity-40 ${sizes[size]} ${styles[variant]} ${className}`}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-ui-label text-[11px]">{children}</span>
  );
}

export function PillGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-cream)] p-0.5">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  dot,
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "violet";
  dot?: boolean;
  className?: string;
}) {
  const tones = {
    neutral:
      "bg-[var(--color-hover-surface)] text-[var(--color-ink-secondary)] border border-[var(--color-border)]",
    accent:
      "bg-[var(--color-primary-muted)] text-[var(--color-primary-deep)] border border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))]",
    success:
      "bg-[var(--color-green-muted)] text-[var(--color-green-bright)] border border-[color-mix(in_srgb,var(--color-green)_40%,var(--color-border-green))]",
    warning:
      "bg-[color-mix(in_srgb,var(--color-amber)_15%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)]",
    violet:
      "bg-[color-mix(in_srgb,var(--color-violet)_15%,transparent)] text-[var(--color-violet)] border border-[color-mix(in_srgb,var(--color-violet)_30%,transparent)]",
  };
  const dotColor = {
    neutral: "bg-[var(--color-ink-faint)]",
    accent: "bg-[var(--color-primary-deep)]",
    success: "bg-[var(--color-green)]",
    warning: "bg-[var(--color-amber)]",
    violet: "bg-[var(--color-violet)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[tone]}`} />}
      {children}
    </span>
  );
}

export function Divider() {
  return <div className="my-5 h-px bg-[var(--color-border)]" />;
}

export function Row({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3 last:border-0 transition-colors hover:bg-[var(--color-hover-surface)]/60 ${className}`}
    >
      {children}
    </div>
  );
}

/** Avatar circle with initials */
export function Avatar({
  initials,
  colorIndex = 0,
  accentBg,
  accentText,
  className = "",
}: {
  initials: string;
  colorIndex?: number;
  accentBg?: string;
  accentText?: string;
  className?: string;
}) {
  const colors = [
    "bg-[var(--color-primary-muted)] text-[var(--color-primary-deep)]",
    "bg-[var(--color-green-muted)] text-[var(--color-green)]",
    "bg-[color-mix(in_srgb,var(--color-primary)_18%,var(--color-surface))] text-[var(--color-primary)]",
    "bg-[color-mix(in_srgb,var(--color-violet)_22%,var(--color-surface))] text-[var(--color-violet)]",
    "bg-[color-mix(in_srgb,var(--color-blue)_22%,var(--color-surface))] text-[var(--color-blue)]",
    "bg-[color-mix(in_srgb,var(--color-red)_18%,var(--color-surface))] text-[var(--color-red)]",
  ];
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
        accentBg ? "" : colors[colorIndex % colors.length]
      } ${className}`}
      style={
        accentBg
          ? { backgroundColor: accentBg, color: accentText ?? "var(--color-white-paper)" }
          : undefined
      }
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
}
