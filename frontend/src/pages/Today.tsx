import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api/client";
import type { CoreTask, LifeArea, LifeGoal, ShortTermGoal, WeeklyGoal } from "../api/types";
import { Dialog } from "../components/Dialog";
import { TrashButton } from "../components/TrashButton";
import { DIALOG_HINTS, EMPTY_HINTS, PAGE_HINTS } from "../copy/hints";
import { GoalColorMark } from "../components/GoalColorMark";
import { getLifeGoalColor } from "../utils/goalColors";
import { resolveGoalChain } from "../utils/goalChain";
import { IconCheck, IconChevron, IconFilter, IconPlus, IconToday } from "../components/icons";
import { Select } from "../components/Select";
import { useToast } from "../components/Toast";
import {
  Avatar,
  Badge,
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Label,
  Panel,
  PillGroup,
  Row,
  TableToolbar,
  Textarea,
} from "../components/ui";
import { runAction } from "../utils/runAction";
import {
  formatDisplayDate,
  isoToDate,
  shiftDate,
  todayLocal,
  weekBounds,
  weeklyGoalInWeek,
} from "../utils/dates";

const TASK_ROW_GRID =
  "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(5.5rem,auto)] sm:items-center sm:gap-3";

const COL_CENTER = "hidden min-w-0 justify-center sm:flex";

function taskInitials(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`;
  return title.slice(0, 2);
}

type LifeGoalTaskGroup = {
  key: string;
  lifeGoalId: number | null;
  title: string;
  lifeAreaLabel: string | null;
  tasks: CoreTask[];
};

function GoalColumnCell({
  title,
  lifeGoalId,
}: {
  title: string | null | undefined;
  lifeGoalId?: number | null;
}) {
  if (!title) {
    return <span className="text-xs text-[var(--color-ink-disabled)]">—</span>;
  }
  const color = lifeGoalId ? getLifeGoalColor(lifeGoalId) : null;
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-[var(--color-border-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-secondary)]"
      style={
        color
          ? {
              backgroundColor: color.muted,
              borderColor: color.border,
              color: color.text,
            }
          : undefined
      }
      title={title}
    >
      <span className="truncate">{title}</span>
    </span>
  );
}

export function Today() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date") ?? todayLocal();
  const isToday = date === todayLocal();

  const [tasks, setTasks] = useState<CoreTask[]>([]);
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [shortTermGoals, setShortTermGoals] = useState<ShortTermGoal[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newWeeklyGoalId, setNewWeeklyGoalId] = useState<number | "">("");
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const setDate = (d: string) => setSearchParams({ date: d });

  const load = useCallback(async () => {
    const [t, a, lg, wg, st, settings] = await Promise.all([
      api.coreTasks.list(date),
      api.lifeAreas.list(),
      api.lifeGoals.list(),
      api.weeklyGoals.list(),
      api.shortTermGoals.list(),
      api.settings.get(),
    ]);
    setTasks(t);
    setAreas(a);
    setLifeGoals(lg);
    setWeeklyGoals(wg);
    setShortTermGoals(st);
    setWeekStartsOn(settings.week_starts_on as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  }, [date]);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load today"));
  }, [load, toast]);

  const filteredTasks = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, filter]);

  const done = tasks.filter((t) => t.completed_at).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const weeklyFocusForDay = useMemo(() => {
    const b = weekBounds(isoToDate(date), weekStartsOn);
    return weeklyGoals.filter((g) => weeklyGoalInWeek(g, b));
  }, [weeklyGoals, date, weekStartsOn]);

  const tasksByLifeGoal = useMemo((): LifeGoalTaskGroup[] => {
    const buckets = new Map<number | null, CoreTask[]>();
    for (const task of filteredTasks) {
      const chain = resolveGoalChain(
        task,
        weeklyGoals,
        shortTermGoals,
        lifeGoals,
        areas
      );
      const key = chain.lifeGoalId;
      const list = buckets.get(key) ?? [];
      list.push(task);
      buckets.set(key, list);
    }

    const groups: LifeGoalTaskGroup[] = [];
    for (const lg of lifeGoals) {
      const list = buckets.get(lg.id);
      if (!list?.length) continue;
      const area = areas.find((a) => a.id === lg.life_area_id);
      groups.push({
        key: `lg-${lg.id}`,
        lifeGoalId: lg.id,
        title: lg.title,
        lifeAreaLabel: area?.label ?? null,
        tasks: list,
      });
      buckets.delete(lg.id);
    }

    for (const [id, list] of buckets) {
      if (!list.length) continue;
      const lg = id != null ? lifeGoals.find((g) => g.id === id) : null;
      groups.push({
        key: id != null ? `lg-${id}` : "unlinked",
        lifeGoalId: id,
        title: lg?.title ?? (id != null ? "Life goal" : "Unlinked"),
        lifeAreaLabel: null,
        tasks: list,
      });
    }

    return groups;
  }, [filteredTasks, weeklyGoals, shortTermGoals, lifeGoals, areas]);

  function closeAdd() {
    setAddOpen(false);
    setNewTitle("");
    setNewWeeklyGoalId("");
  }

  async function addTask() {
    if (!newTitle.trim()) {
      toast.error("Enter a task title");
      return;
    }
    const ok = await runAction(
      toast,
      async () => {
        await api.coreTasks.create({
          task_date: date,
          title: newTitle.trim(),
          weekly_goal_id: newWeeklyGoalId === "" ? null : newWeeklyGoalId,
        });
        setNewTitle("");
        setNewWeeklyGoalId("");
        await load();
      },
      { success: "Core task added" }
    );
    if (ok) closeAdd();
  }

  async function toggleTask(task: CoreTask) {
    const completing = !task.completed_at;
    await runAction(
      toast,
      async () => {
        await api.coreTasks.update(task.id, {
          completed_at: completing ? new Date().toISOString() : null,
        });
        await load();
      },
      {
        success: completing ? "Task completed — momentum updated" : "Task marked incomplete",
      }
    );
  }

  async function saveTaskField(id: number, data: Partial<CoreTask>, quiet = false) {
    if (quiet) {
      try {
        await api.coreTasks.update(id, data);
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update task");
      }
      return;
    }
    await runAction(toast, () => api.coreTasks.update(id, data).then(load), {
      success: "Task updated",
    });
  }

  async function removeTask(id: number) {
    await runAction(toast, () => api.coreTasks.remove(id).then(load), {
      success: "Task removed",
    });
  }

  return (
    <div>
      <ContentHeader
        title={isToday ? "Core tasks" : formatDisplayDate(date)}
        subtitle={PAGE_HINTS.coreTasks}
        icon={<IconToday className="h-4 w-4" />}
      >
        <PillGroup>
          <Button variant="ghost" size="sm" onClick={() => setDate(shiftDate(date, -1))}>
            ←
          </Button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => setDate(todayLocal())}>
              Today
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDate(shiftDate(date, 1))}>
            →
          </Button>
        </PillGroup>
        {total > 0 && (
          <Badge tone={done === total ? "success" : "accent"}>
            {done}/{total} · {pct}%
          </Badge>
        )}
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          Add task
        </Button>
      </ContentHeader>

      <Panel padding={false} className="overflow-hidden">
          <TableToolbar
            search={filter}
            onSearchChange={setFilter}
            searchPlaceholder="Search tasks…"
            filter={
              <Button variant="outline" size="sm">
                <IconFilter className="mr-1 h-3.5 w-3.5" />
                Filter
              </Button>
            }
            actions={
              <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
                <IconPlus className="h-3.5 w-3.5" />
                Add task
              </Button>
            }
          />

          {total === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Nothing scheduled yet"
                hint={EMPTY_HINTS.noCoreTasks}
              />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No matches" hint={EMPTY_HINTS.noSearch} />
            </div>
          ) : (
            <ul>
              <li
                className={`hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-ui-label text-[11px] ${TASK_ROW_GRID}`}
              >
                <span>Task</span>
                <div className={COL_CENTER}>
                  <span>Weekly focus</span>
                </div>
                <div className={COL_CENTER}>
                  <span>Short-term goal</span>
                </div>
                <div className={COL_CENTER}>
                  <span>Status</span>
                </div>
              </li>
              <AnimatePresence initial={false}>
                {tasksByLifeGoal.map((group) => {
                  const groupColor = group.lifeGoalId
                    ? getLifeGoalColor(group.lifeGoalId)
                    : null;
                  return (
                    <Fragment key={group.key}>
                      <li
                        className="border-b border-[var(--color-border-subtle)] bg-[color-mix(in_srgb,var(--color-white-cream)_35%,var(--color-surface))] px-4 py-2.5"
                        style={
                          groupColor
                            ? {
                                borderLeftWidth: 3,
                                borderLeftStyle: "solid",
                                borderLeftColor: groupColor.solid,
                              }
                            : undefined
                        }
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {group.lifeGoalId != null && (
                            <GoalColorMark lifeGoalId={group.lifeGoalId} size="sm" />
                          )}
                          <span className="text-sm font-semibold text-[var(--color-ink)]">
                            {group.title}
                          </span>
                          {group.lifeAreaLabel && (
                            <Badge tone="neutral">{group.lifeAreaLabel}</Badge>
                          )}
                          <span className="text-ui-caption text-xs text-[var(--color-ink-muted)]">
                            {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </li>
                      {group.tasks.map((task, idx) => {
                        const open = expanded === task.id;
                        const chain = resolveGoalChain(
                          task,
                          weeklyGoals,
                          shortTermGoals,
                          lifeGoals,
                          areas
                        );
                        const goalColor = chain.lifeGoalId
                          ? getLifeGoalColor(chain.lifeGoalId)
                          : null;
                        const weeklyFocus = chain.weeklyGoalId
                          ? weeklyGoals.find((w) => w.id === chain.weeklyGoalId)
                          : null;
                        const shortTerm = chain.shortTermGoalId
                          ? shortTermGoals.find((s) => s.id === chain.shortTermGoalId)
                          : null;
                        return (
                          <li
                            key={task.id}
                            className="border-l-[3px] border-transparent"
                            style={
                              goalColor ? { borderLeftColor: goalColor.solid } : undefined
                            }
                          >
                      <Row className={`!items-center ${TASK_ROW_GRID}`}>
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                              task.completed_at
                                ? "border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-[var(--color-on-accent)]"
                                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
                            }`}
                          >
                            {task.completed_at && <IconCheck />}
                          </button>
                          <Avatar
                            initials={taskInitials(task.title)}
                            colorIndex={idx}
                            accentBg={goalColor?.muted}
                            accentText={goalColor?.text}
                          />
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => setExpanded(open ? null : task.id)}
                          >
                            <span
                              className={`block text-sm font-medium ${
                                task.completed_at
                                  ? "text-[var(--color-ink-faint)] line-through"
                                  : "text-[var(--color-ink)]"
                              }`}
                            >
                              {task.title}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="sm:hidden"
                            onClick={() => setExpanded(open ? null : task.id)}
                            aria-label="Expand"
                          >
                            <IconChevron open={open} />
                          </button>
                        </div>
                        <div className={COL_CENTER}>
                          <GoalColumnCell
                            title={weeklyFocus?.title}
                            lifeGoalId={chain.lifeGoalId}
                          />
                        </div>
                        <div className={COL_CENTER}>
                          <GoalColumnCell
                            title={shortTerm?.title}
                            lifeGoalId={chain.lifeGoalId}
                          />
                        </div>
                        <div className="hidden items-center justify-center gap-2 sm:flex">
                          <Badge tone={task.completed_at ? "success" : "neutral"}>
                            {task.completed_at ? "Done" : "Open"}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => setExpanded(open ? null : task.id)}
                            aria-label="Expand"
                          >
                            <IconChevron open={open} />
                          </button>
                        </div>
                      </Row>
                      <AnimatePresence>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]"
                          >
                            <div className="space-y-3 px-4 py-4 sm:pl-[4.5rem]">
                              <div className="grid gap-2 sm:hidden">
                                <div>
                                  <Label>Weekly focus</Label>
                                  <p className="text-sm text-[var(--color-ink)]">
                                    {weeklyFocus?.title ?? "—"}
                                  </p>
                                </div>
                                <div>
                                  <Label>Short-term goal</Label>
                                  <p className="text-sm text-[var(--color-ink)]">
                                    {shortTerm?.title ?? "—"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label>Notes</Label>
                                <Textarea
                                  rows={2}
                                  defaultValue={task.notes ?? ""}
                                  onBlur={(e) =>
                                    saveTaskField(task.id, { notes: e.target.value || null }, true)
                                  }
                                />
                              </div>
                              <div>
                                <Label>Weekly focus</Label>
                                <Select
                                  defaultValue={task.weekly_goal_id ?? ""}
                                  onChange={(e) =>
                                    saveTaskField(task.id, {
                                      weekly_goal_id: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    })
                                  }
                                >
                                  <option value="">None</option>
                                  {weeklyFocusForDay.map((w) => {
                                    const st = shortTermGoals.find(
                                      (s) => s.id === w.short_term_goal_id
                                    );
                                    const lg = st
                                      ? lifeGoals.find((g) => g.id === st.life_goal_id)
                                      : null;
                                    return (
                                      <option key={w.id} value={w.id}>
                                        {w.title}
                                        {lg ? ` · ${lg.title}` : ""}
                                      </option>
                                    );
                                  })}
                                </Select>
                              </div>
                              <TrashButton
                                label="Remove task"
                                onClick={() => removeTask(task.id)}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                          </li>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-ui-caption text-xs">
            <span>
              {filteredTasks.length} of {total} task{total !== 1 ? "s" : ""}
            </span>
          </div>

        </Panel>

      <Dialog
        open={addOpen}
        onClose={closeAdd}
        title="Add core task"
        description={DIALOG_HINTS.addCoreTask}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={addTask}>
              Add task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              autoFocus
              placeholder="What will you do today?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </div>
          <div>
            <Label>Weekly focus (optional)</Label>
            <Select
              value={newWeeklyGoalId}
              onChange={(e) =>
                setNewWeeklyGoalId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">None</option>
              {weeklyFocusForDay.map((w) => {
                const st = shortTermGoals.find((s) => s.id === w.short_term_goal_id);
                const lg = st ? lifeGoals.find((g) => g.id === st.life_goal_id) : null;
                return (
                  <option key={w.id} value={w.id}>
                    {w.title}
                    {lg ? ` · ${lg.title}` : ""}
                  </option>
                );
              })}
            </Select>
            {weeklyFocusForDay.length === 0 && (
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                No focus for this week yet — add one on the Week page.
              </p>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
