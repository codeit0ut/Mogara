import type { CoreTask, LifeArea, LifeGoal, ShortTermGoal, WeeklyGoal } from "../api/types";

export type GoalChain = {
  weeklyGoalId: number | null;
  shortTermGoalId: number | null;
  lifeGoalId: number | null;
  lifeAreaId: number | null;
  lifeAreaLabel: string | null;
};

export function resolveGoalChain(
  task: Pick<CoreTask, "weekly_goal_id">,
  weeklyGoals: WeeklyGoal[],
  shortTermGoals: ShortTermGoal[],
  lifeGoals: LifeGoal[],
  areas: LifeArea[]
): GoalChain {
  const empty: GoalChain = {
    weeklyGoalId: null,
    shortTermGoalId: null,
    lifeGoalId: null,
    lifeAreaId: null,
    lifeAreaLabel: null,
  };
  if (!task.weekly_goal_id) return empty;

  const wg = weeklyGoals.find((w) => w.id === task.weekly_goal_id);
  if (!wg) return { ...empty, weeklyGoalId: task.weekly_goal_id };

  const st = shortTermGoals.find((s) => s.id === wg.short_term_goal_id);
  if (!st) {
    return { ...empty, weeklyGoalId: wg.id, shortTermGoalId: wg.short_term_goal_id };
  }

  const lg = lifeGoals.find((g) => g.id === st.life_goal_id);
  if (!lg) {
    return {
      ...empty,
      weeklyGoalId: wg.id,
      shortTermGoalId: st.id,
      lifeGoalId: st.life_goal_id,
    };
  }

  const area = lg.life_area_id ? areas.find((a) => a.id === lg.life_area_id) : null;
  return {
    weeklyGoalId: wg.id,
    shortTermGoalId: st.id,
    lifeGoalId: lg.id,
    lifeAreaId: lg.life_area_id,
    lifeAreaLabel: area?.label ?? null,
  };
}

export function resolveLifeGoalIdFromWeekly(
  weeklyGoalId: number | null | undefined,
  weeklyGoals: WeeklyGoal[],
  shortTermGoals: ShortTermGoal[]
): number | null {
  if (!weeklyGoalId) return null;
  const wg = weeklyGoals.find((w) => w.id === weeklyGoalId);
  if (!wg) return null;
  const st = shortTermGoals.find((s) => s.id === wg.short_term_goal_id);
  return st?.life_goal_id ?? null;
}
