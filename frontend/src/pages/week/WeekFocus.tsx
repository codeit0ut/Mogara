import { useState } from "react";
import { api } from "../../api/client";
import { Dialog } from "../../components/Dialog";
import { GoalColorMark } from "../../components/GoalColorMark";
import { TrashButton } from "../../components/TrashButton";
import { WeekNav } from "../../components/WeekNav";
import { IconPlus, IconWeek } from "../../components/icons";
import { getLifeGoalColor } from "../../utils/goalColors";
import { useToast } from "../../components/Toast";
import { Select } from "../../components/Select";
import { DIALOG_HINTS, EMPTY_HINTS, PAGE_HINTS, SECTION_HINTS } from "../../copy/hints";
import { useWeekData } from "../../hooks/useWeekData";
import { useGoalsData } from "../../hooks/useGoalsData";
import { runAction } from "../../utils/runAction";
import {
  Badge,
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Label,
  Panel,
  SectionTitle,
} from "../../components/ui";

export function WeekFocus() {
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { goals: lifeGoals } = useGoalsData();
  const {
    bounds,
    isCurrentWeek,
    shiftWeek,
    goToThisWeek,
    weeklyGoals,
    shortTermGoals,
    wgTitle,
    setWgTitle,
    wgShortTermId,
    setWgShortTermId,
    load,
    addWeeklyGoal,
    submitted,
  } = useWeekData();

  function closeAdd() {
    setAddOpen(false);
    setWgTitle("");
    setWgShortTermId("");
  }

  async function submitFocus() {
    const ok = await addWeeklyGoal();
    if (ok) closeAdd();
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Weekly focus"
        subtitle={PAGE_HINTS.weeklyFocus}
        icon={<IconWeek className="h-4 w-4" />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <WeekNav
            startDate={bounds.startDate}
            endDate={bounds.endDate}
            isCurrentWeek={isCurrentWeek}
            onPrev={() => shiftWeek(-1)}
            onNext={() => shiftWeek(1)}
            onThisWeek={goToThisWeek}
          />
          {submitted && <Badge tone="success">Review submitted</Badge>}
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <IconPlus className="h-3.5 w-3.5" />
            Add weekly focus
          </Button>
        </div>
      </ContentHeader>

      <Panel>
        <SectionTitle hint={SECTION_HINTS.weeklyFocusList}>
          This week&apos;s focus
        </SectionTitle>
        {weeklyGoals.length === 0 ? (
          <EmptyState
            title="No weekly focus yet"
            hint={EMPTY_HINTS.noWeeklyFocus}
            action={
              <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
                <IconPlus className="h-3.5 w-3.5" />
                Add weekly focus
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {weeklyGoals.map((g) => {
              const st = shortTermGoals.find((s) => s.id === g.short_term_goal_id);
              const lg = st ? lifeGoals.find((l) => l.id === st.life_goal_id) : null;
              const color = st ? getLifeGoalColor(st.life_goal_id) : null;
              return (
                <li
                  key={g.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border-subtle)] px-4 py-3"
                  style={color ? { backgroundColor: color.muted } : undefined}
                >
                  <div className="min-w-0">
                    <span className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      {st && <GoalColorMark lifeGoalId={st.life_goal_id} size="sm" />}
                      {g.title}
                    </span>
                    {st && (
                      <p className="mt-1 pl-4 text-xs text-[var(--color-ink-muted)]">
                        {st.title}
                        {lg ? ` → ${lg.title}` : ""}
                      </p>
                    )}
                  </div>
                  <TrashButton
                    label="Remove weekly focus"
                    onClick={() =>
                      runAction(toast, () => api.weeklyGoals.remove(g.id).then(load), {
                        success: "Weekly focus removed",
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Dialog
        open={addOpen}
        onClose={closeAdd}
        title="Add weekly focus"
        description={DIALOG_HINTS.addWeeklyFocus}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={submitFocus}>
              Add focus
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>What matters this week?</Label>
            <Input
              autoFocus
              placeholder="e.g. Ship the portfolio draft"
              value={wgTitle}
              onChange={(e) => setWgTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && wgTitle.trim()) {
                  e.preventDefault();
                  void submitFocus();
                }
              }}
            />
          </div>
          <div>
            <Label>Short-term goal</Label>
            <Select
              value={wgShortTermId}
              onChange={(e) => setWgShortTermId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Choose…</option>
              {shortTermGoals.map((s) => {
                const lg = lifeGoals.find((g) => g.id === s.life_goal_id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.title}
                    {lg ? ` (${lg.title})` : ""}
                  </option>
                );
              })}
            </Select>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
