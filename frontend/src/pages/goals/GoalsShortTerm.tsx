import { useState } from "react";
import { api } from "../../api/client";
import { Dialog } from "../../components/Dialog";
import { TrashButton } from "../../components/TrashButton";
import { GoalColorMark } from "../../components/GoalColorMark";
import { IconGoals, IconPlus } from "../../components/icons";
import { Select } from "../../components/Select";
import { useToast } from "../../components/Toast";
import { DIALOG_HINTS, EMPTY_HINTS, PAGE_HINTS, SECTION_HINTS } from "../../copy/hints";
import { useGoalsData } from "../../hooks/useGoalsData";
import { getLifeGoalColor } from "../../utils/goalColors";
import { runAction } from "../../utils/runAction";
import {
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Label,
  Panel,
  SectionTitle,
} from "../../components/ui";

export function GoalsShortTerm() {
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { goals, shortTerm, stTitle, setStTitle, stParent, setStParent, load } = useGoalsData();

  function closeAdd() {
    setAddOpen(false);
    setStTitle("");
    setStParent("");
  }

  async function submitShortTerm() {
    if (!stTitle.trim() || stParent === "") {
      toast.error("Choose a parent life goal and enter a title");
      return;
    }
    const ok = await runAction(
      toast,
      async () => {
        await api.shortTermGoals.create({
          life_goal_id: stParent,
          title: stTitle.trim(),
        });
        setStTitle("");
        setStParent("");
        await load();
      },
      { success: "Short-term goal added" }
    );
    if (ok) closeAdd();
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Short-term goals"
        subtitle={PAGE_HINTS.shortTermGoals}
        icon={<IconGoals className="h-4 w-4" />}
      >
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          Add short-term goal
        </Button>
      </ContentHeader>

      <Panel>
        <SectionTitle hint={SECTION_HINTS.shortTermGoalsList}>
          Short-term goals
        </SectionTitle>
        {shortTerm.length === 0 ? (
          <EmptyState
            title="No short-term goals yet"
            hint={EMPTY_HINTS.noShortTerm}
            action={
              <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
                <IconPlus className="h-3.5 w-3.5" />
                Add short-term goal
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {shortTerm.map((s) => {
              const parent = goals.find((g) => g.id === s.life_goal_id);
              const color = getLifeGoalColor(s.life_goal_id);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3"
                  style={{ backgroundColor: color.muted }}
                >
                  <div className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                      <GoalColorMark lifeGoalId={s.life_goal_id} size="sm" />
                      {s.title}
                    </span>
                    {parent && (
                      <p className="mt-1 pl-4 text-xs text-[var(--color-ink-muted)]">
                        {parent.title}
                      </p>
                    )}
                  </div>
                  <TrashButton
                    label="Remove short-term goal"
                    onClick={() =>
                      runAction(toast, () => api.shortTermGoals.remove(s.id).then(load), {
                        success: "Short-term goal removed",
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
        title="Add short-term goal"
        description={DIALOG_HINTS.addShortTerm}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={submitShortTerm}>
              Add goal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Parent life goal</Label>
            <Select
              value={stParent}
              onChange={(e) => setStParent(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Choose…</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input
              autoFocus
              value={stTitle}
              onChange={(e) => setStTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitShortTerm()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
