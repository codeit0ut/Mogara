import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import {
  endOfMonth,
  format,
  getDay,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { api } from "../api/client";
import { IconCalendar } from "../components/icons";
import { PAGE_HINTS } from "../copy/hints";
import { Badge, ContentHeader, Panel } from "../components/ui";
import { getLifeGoalColor } from "../utils/goalColors";
import { resolveLifeGoalIdFromWeekly } from "../utils/goalChain";
import { isoToDate } from "../utils/dates";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

type CalEvent = {
  title: string;
  start: Date;
  end: Date;
  resource?: { type: string; lifeGoalId?: number | null };
};

export function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [dayStatus, setDayStatus] = useState<Record<string, string>>({});

  const loadEvents = useCallback(() => {
    Promise.all([
      api.coreTasks.list(),
      api.weeklyGoals.list(),
      api.shortTermGoals.list(),
    ]).then(([tasks, weeklyGoals, shortTermGoals]) => {
      const ev: CalEvent[] = [];
      for (const t of tasks) {
        const lifeGoalId = resolveLifeGoalIdFromWeekly(
          t.weekly_goal_id,
          weeklyGoals,
          shortTermGoals
        );
        if (t.scheduled_for) {
          const start = isoToDate(t.scheduled_for);
          const end = t.scheduled_end
            ? isoToDate(t.scheduled_end)
            : new Date(start.getTime() + 3600000);
          ev.push({
            title: t.title,
            start,
            end,
            resource: { type: "task", lifeGoalId },
          });
        } else {
          const d = isoToDate(t.task_date);
          ev.push({
            title: t.title,
            start: d,
            end: d,
            resource: { type: "task", lifeGoalId },
          });
        }
      }
      setEvents(ev);
    });
  }, []);

  const loadOverlay = useCallback((cursor: Date) => {
    const from = format(startOfMonth(cursor), "yyyy-MM-dd");
    const to = format(endOfMonth(cursor), "yyyy-MM-dd");
    api.analytics.dayActivity(from, to).then((rows) => {
      const map: Record<string, string> = {};
      for (const r of rows) map[r.date] = r.status;
      setDayStatus(map);
    });
  }, []);

  useEffect(() => {
    loadEvents();
    loadOverlay(date);
  }, [loadEvents, loadOverlay, date]);

  const eventStyleGetter = useMemo(
    () => (event: CalEvent) => {
      const id = event.resource?.lifeGoalId;
      if (id) {
        const c = getLifeGoalColor(id);
        return {
          style: {
            backgroundColor: c.solid,
            borderColor: c.solid,
            color: "var(--color-white-paper)",
          },
        };
      }
      return {};
    },
    []
  );

  const dayPropGetter = useCallback(
    (d: Date) => {
      const key = format(d, "yyyy-MM-dd");
      const status = dayStatus[key];
      if (status === "active") return { className: "day-active" };
      if (status === "inactive") return { className: "day-inactive" };
      return {};
    },
    [dayStatus]
  );

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Calendar"
        subtitle={PAGE_HINTS.calendar}
        icon={<IconCalendar className="h-4 w-4" />}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">Green tint = showed up</Badge>
          <Badge tone="neutral">Quieter = untouched tasks</Badge>
        </div>
      </ContentHeader>

      <Panel padding={false} className="overflow-hidden p-4">
        <div className="h-[min(70vh,520px)]">
          <Calendar
            localizer={localizer}
            events={events}
            view={view}
            onView={setView}
            date={date}
            onNavigate={(d) => {
              setDate(d);
              loadOverlay(d);
            }}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            onSelectEvent={(ev) => {
              const d = format(ev.start, "yyyy-MM-dd");
              navigate(`/?date=${d}`);
            }}
            onSelectSlot={({ start }) => {
              navigate(`/?date=${format(start, "yyyy-MM-dd")}`);
            }}
            selectable
            popup
            views={["month", "week", "day"]}
          />
        </div>
      </Panel>
    </div>
  );
}
