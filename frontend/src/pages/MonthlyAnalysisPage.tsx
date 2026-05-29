import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { MonthlyAnalysisMonth } from "../api/types";
import { AnalysisPeriodCard } from "../components/AnalysisPeriodCard";
import { useToast } from "../components/Toast";
import { IconAnalysis } from "../components/icons";
import { EMPTY_HINTS, PAGE_HINTS } from "../copy/hints";
import { Select } from "../components/Select";
import { ContentHeader, EmptyState, Panel } from "../components/ui";

const MONTH_NAMES = [
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
];

function currentYear() {
  return String(new Date().getFullYear());
}

function yearOptions() {
  const end = new Date().getFullYear() + 1;
  const start = end - 8;
  const years: number[] = [];
  for (let y = end; y >= start; y--) years.push(y);
  return years;
}

function formatMonthLabel(month: MonthlyAnalysisMonth) {
  const monthIndex = Number(month.month_start.slice(5, 7)) - 1;
  return MONTH_NAMES[monthIndex] ?? month.month_start.slice(5, 7);
}

export function MonthlyAnalysisPage() {
  const toast = useToast();
  const [year, setYear] = useState(currentYear);
  const [months, setMonths] = useState<MonthlyAnalysisMonth[]>([]);
  const [loading, setLoading] = useState(false);
  const years = useMemo(yearOptions, []);

  const load = useCallback(
    async (yearKey: string) => {
      setLoading(true);
      try {
        const rows = await api.analytics.monthlyAnalysis(yearKey);
        setMonths(rows);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load monthly analysis");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void load(year);
  }, [load, year]);

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Monthly analysis"
        subtitle={PAGE_HINTS.monthlyAnalysis}
        icon={<IconAnalysis className="h-4 w-4" />}
      >
        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Select year"
          className="min-w-[7rem]"
        >
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </Select>
      </ContentHeader>

      <Panel className="max-w-5xl">
        {loading ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Loading monthly analysis…</p>
        ) : months.length === 0 ? (
          <EmptyState title="No monthly data" hint={EMPTY_HINTS.noMonthlyAnalysis} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-ink-muted)]">{year}</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {months.map((month) => (
                <AnalysisPeriodCard
                  key={month.month_start}
                  title={formatMonthLabel(month)}
                  momentumDelta={month.momentum_delta}
                  tasksSet={month.tasks_set}
                  tasksCompleted={month.tasks_completed}
                  momentumPoints={month.momentum_points}
                />
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </div>
  );
}
