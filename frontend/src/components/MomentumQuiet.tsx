import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { MomentumCurrent, MomentumEvent } from "../api/types";
import { buildMomentumTrend } from "../utils/momentumTrend";
import { MomentumSparkline, TrendField, trendTone } from "./MomentumSparkline";

function weekDeltaFromEvents(events: MomentumEvent[]): number {
  const cut = new Date();
  cut.setDate(cut.getDate() - 7);
  return events
    .filter((e) => new Date(e.local_date + "T12:00:00") >= cut)
    .reduce((s, e) => s + e.change, 0);
}

export function MomentumQuiet({
  variant = "featured",
}: {
  /** @deprecated use variant */
  compact?: boolean;
  variant?: "featured" | "compact";
}) {
  const { user } = useAuth();
  const [m, setM] = useState<MomentumCurrent | null>(null);
  const [journey, setJourney] = useState<{ value: number }[]>([]);
  const [events, setEvents] = useState<MomentumEvent[]>([]);

  useEffect(() => {
    if (!user) {
      setM(null);
      setJourney([]);
      setEvents([]);
      return;
    }

    const load = async () => {
      const [cur, j, ev] = await Promise.allSettled([
        api.momentum.current(),
        api.analytics.momentumJourney(),
        api.momentum.events(),
      ]);
      if (cur.status === "fulfilled") setM(cur.value);
      if (j.status === "fulfilled") setJourney(j.value);
      else setJourney([]);
      if (ev.status === "fulfilled") setEvents(ev.value);
      else setEvents([]);
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const fields = useMemo(() => {
    if (!m) return null;
    return buildMomentumTrend(m, journey, weekDeltaFromEvents(events));
  }, [m, journey, events]);

  if (!m || !fields) return null;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-ui-label">Momentum</span>
        <span className="font-semibold tabular-nums text-[var(--color-primary-bright)]">{m.value}</span>
      </div>
    );
  }

  const weekTone =
    fields.weekDelta > 0 ? "up" : fields.weekDelta < 0 ? "down" : "neutral";
  const weekLabel =
    fields.weekDelta > 0 ? `+${fields.weekDelta}` : String(fields.weekDelta);

  return (
    <Link
      to="/insights"
      title={fields.detail}
      className="group flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-green)] bg-[var(--color-white-paper)] px-2.5 shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--color-border-focus)] hover:bg-[var(--color-white-petal)] md:gap-3 md:px-3"
    >
      {/* Score cluster */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-caption)]">
          Momentum
        </span>
        <span className="text-sm font-semibold tabular-nums leading-none text-gold">{m.value}</span>
        <span className="hidden rounded-full border border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))] bg-[var(--color-primary-muted)] px-1.5 py-px text-[9px] font-medium leading-tight text-[var(--color-primary-deep)] sm:inline">
          {fields.mood}
        </span>
      </div>

      {/* Progress — grows into middle space */}
      <div
        className="hidden h-0.5 min-w-[2.5rem] flex-1 overflow-hidden rounded-full bg-[var(--color-green-muted)] sm:block"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-green-vein)] to-[var(--color-primary)] transition-all duration-500"
          style={{ width: `${fields.pct}%` }}
        />
      </div>

      <span className="hidden h-4 w-px shrink-0 bg-[var(--color-border-subtle)] sm:block" aria-hidden />

      {/* Sparkline stretches; stats pinned to the right of this zone */}
      <div className="flex min-w-0 flex-[2] items-center gap-2 sm:gap-3 md:gap-4">
        <div className="min-w-[2.5rem] flex-1">
          <MomentumSparkline values={fields.sparkValues} trend={fields.trend} height={20} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-5 lg:gap-8">
          <TrendField label="Trend" value={fields.trend} tone={trendTone(fields.trend)} />
          {fields.pace !== "—" && (
            <TrendField label="Pace" value={fields.pace} tone={trendTone(fields.pace)} />
          )}
          <TrendField label="7d" value={weekLabel} tone={weekTone} />
        </div>
      </div>

      <span
        className="shrink-0 pl-0.5 text-[10px] text-[var(--color-ink-caption)] transition-transform group-hover:translate-x-px"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
