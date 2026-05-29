import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { WeeklyAnalysisWeek } from "../api/types";
import { AnalysisPeriodCard } from "../components/AnalysisPeriodCard";
import { useToast } from "../components/Toast";
import { IconAnalysis } from "../components/icons";
import { EMPTY_HINTS, PAGE_HINTS } from "../copy/hints";
import { Select } from "../components/Select";
import { ContentHeader, EmptyState, Panel } from "../components/ui";

function currentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function formatDay(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatWeekRange(week: WeeklyAnalysisWeek) {
  return `${formatDay(week.week_start)} - ${formatDay(week.week_end)}`;
}

function monthOptions() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].map((label, index) => ({
    label,
    value: String(index + 1).padStart(2, "0"),
  }));
}

export function WeeklyAnalysisPage() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonthKey);
  const [weeks, setWeeks] = useState<WeeklyAnalysisWeek[]>([]);
  const [loading, setLoading] = useState(false);
  const options = useMemo(monthOptions, []);

  const load = useCallback(
    async (monthKey: string) => {
      setLoading(true);
      try {
        const rows = await api.analytics.weeklyAnalysis(monthKey);
        setWeeks(rows);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load weekly analysis");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void load(month);
  }, [load, month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, (m || 1) - 1, 1).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [month]);

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Weekly analysis"
        subtitle={PAGE_HINTS.weeklyAnalysis}
        icon={<IconAnalysis className="h-4 w-4" />}
      >
        <div className="flex items-center gap-2">
          <Select
            value={month.slice(0, 4)}
            onChange={(e) => setMonth(`${e.target.value}-${month.slice(5, 7)}`)}
            aria-label="Select year"
            className="min-w-[7rem]"
          >
            {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + 1 - i).map(
              (y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              )
            )}
          </Select>
          <Select
            value={month.slice(5, 7)}
            onChange={(e) => setMonth(`${month.slice(0, 4)}-${e.target.value}`)}
            aria-label="Select month"
            className="min-w-[10rem]"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </ContentHeader>

      <Panel className="max-w-5xl">
        {loading ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Loading weekly analysis…</p>
        ) : weeks.length === 0 ? (
          <EmptyState title="No weekly data" hint={EMPTY_HINTS.noWeeklyAnalysis} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-ink-muted)]">{monthLabel}</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {weeks.map((week) => (
                <AnalysisPeriodCard
                  key={`${week.week_start}-${week.week_end}`}
                  title={formatWeekRange(week)}
                  momentumDelta={week.momentum_delta}
                  tasksSet={week.tasks_set}
                  tasksCompleted={week.tasks_completed}
                  momentumPoints={week.momentum_points}
                />
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </div>
  );
}
