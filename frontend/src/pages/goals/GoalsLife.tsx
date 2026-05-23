import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/client";
import { Dialog } from "../../components/Dialog";
import { TrashButton } from "../../components/TrashButton";
import { GoalColorMark } from "../../components/GoalColorMark";
import { IconChevron, IconGoals, IconPlus } from "../../components/icons";
import { Select } from "../../components/Select";
import { useToast } from "../../components/Toast";
import { useGoalsData } from "../../hooks/useGoalsData";
import { getLifeGoalColor } from "../../utils/goalColors";
import { runAction } from "../../utils/runAction";
import { DIALOG_HINTS, EMPTY_HINTS, PAGE_HINTS, SECTION_HINTS } from "../../copy/hints";
import {
  Badge,
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Label,
  Panel,
  SectionTitle,
  Textarea,
} from "../../components/ui";

export function GoalsLife() {
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const {
    areas,
    goals,
    shortTerm,
    goalTitle,
    setGoalTitle,
    goalSummary,
    setGoalSummary,
    goalAreaId,
    setGoalAreaId,
    editId,
    setEditId,
    load,
  } = useGoalsData();

  function closeAdd() {
    setAddOpen(false);
    setGoalTitle("");
    setGoalSummary("");
    setGoalAreaId("");
  }

  async function submitLifeGoal() {
    if (!goalTitle.trim()) {
      toast.error("Enter a title");
      return;
    }
    const ok = await runAction(
      toast,
      async () => {
        await api.lifeGoals.create({
          title: goalTitle.trim(),
          summary: goalSummary || null,
          life_area_id: goalAreaId === "" ? null : goalAreaId,
        });
        setGoalTitle("");
        setGoalSummary("");
        setGoalAreaId("");
        await load();
      },
      { success: "Life goal added" }
    );
    if (ok) closeAdd();
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Life goals"
        subtitle={PAGE_HINTS.lifeGoals}
        icon={<IconGoals className="h-4 w-4" />}
      >
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          Add life goal
        </Button>
      </ContentHeader>

      <Panel highlight>
        <SectionTitle hint={SECTION_HINTS.lifeGoalsList}>Life goals</SectionTitle>
        {goals.length === 0 ? (
          <EmptyState
            title="No life goals yet"
            hint={EMPTY_HINTS.noLifeGoals}
            action={
              <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
                <IconPlus className="h-3.5 w-3.5" />
                Add life goal
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {goals.map((g) => {
              const open = editId === g.id;
              const color = getLifeGoalColor(g.id);
              const area = areas.find((a) => a.id === g.life_area_id);
              const children = shortTerm.filter((s) => s.life_goal_id === g.id);
              return (
                <li
                  key={g.id}
                  className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-white-paper)] transition-shadow"
                  style={{
                    boxShadow: open ? `0 0 0 1px ${color.border}` : undefined,
                  }}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[color-mix(in_srgb,var(--color-white-cream)_50%,transparent)]"
                    onClick={() => setEditId(open ? null : g.id)}
                  >
                    <GoalColorMark lifeGoalId={g.id} size="lg" className="mt-0.5 w-1" />
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-[var(--color-ink)]">{g.title}</span>
                      {g.summary && (
                        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                          {g.summary}
                        </p>
                      )}
                      {area && (
                        <Badge tone="neutral" className="mt-2">
                          {area.label}
                        </Badge>
                      )}
                    </span>
                    <IconChevron open={open} className="mt-1 shrink-0" />
                  </button>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="space-y-4 border-t px-4 py-4 pl-7"
                          style={{
                            borderColor: color.border,
                            backgroundColor: color.muted,
                          }}
                        >
                          <div>
                            <Label>Motivation</Label>
                            <Textarea
                              rows={2}
                              defaultValue={g.motivation ?? ""}
                              placeholder="Why this matters to you…"
                              onBlur={(e) => {
                                api.lifeGoals
                                  .update(g.id, { motivation: e.target.value || null })
                                  .then(load)
                                  .catch((err) =>
                                    toast.error(
                                      err instanceof Error ? err.message : "Failed to save"
                                    )
                                  );
                              }}
                            />
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] text-[var(--color-ink-muted)]">
                              Archive hides this goal from active lists. Remove deletes it
                              permanently.
                            </p>
                            <div className="flex shrink-0 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  runAction(
                                    toast,
                                    () =>
                                      api.lifeGoals
                                        .update(g.id, { status: "archived" })
                                        .then(() => {
                                          setEditId(null);
                                          return load();
                                        }),
                                    { success: "Goal archived" }
                                  )
                                }
                              >
                                Archive
                              </Button>
                              <TrashButton
                                label="Remove life goal"
                                onClick={() =>
                                  runAction(toast, () => api.lifeGoals.remove(g.id).then(load), {
                                    success: "Life goal removed",
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {children.length > 0 && (
                    <ul className="space-y-1.5 border-t border-[var(--color-border-subtle)] px-4 py-3 pl-7">
                      {children.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                          style={{ backgroundColor: color.muted }}
                        >
                          <span className="flex items-center gap-2 text-[var(--color-ink-secondary)]">
                            <GoalColorMark lifeGoalId={g.id} size="sm" />
                            {s.title}
                          </span>
                          <TrashButton
                            label="Remove short-term goal"
                            onClick={() =>
                              runAction(toast, () => api.shortTermGoals.remove(s.id).then(load), {
                                success: "Short-term goal removed",
                              })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}

      </Panel>

      <Dialog
        open={addOpen}
        onClose={closeAdd}
        title="Add life goal"
        description={DIALOG_HINTS.addLifeGoal}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={submitLifeGoal}>
              Add goal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              autoFocus
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Summary (short)</Label>
            <Input value={goalSummary} onChange={(e) => setGoalSummary(e.target.value)} />
          </div>
          <div>
            <Label>Life area (optional)</Label>
            <Select
              value={goalAreaId}
              onChange={(e) => setGoalAreaId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">None</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
