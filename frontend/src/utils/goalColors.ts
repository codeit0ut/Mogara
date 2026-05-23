/** Deterministic accent colors per life goal (stable across sessions). */

export type GoalColor = {
  solid: string;
  muted: string;
  border: string;
  text: string;
};

const PALETTE: GoalColor[] = [
  { solid: "#5e8f6a", muted: "#e8f0ea", border: "#c5d4c8", text: "#3d5c48" },
  { solid: "#8f6b1f", muted: "#f8edd4", border: "#edd896", text: "#6b5220" },
  { solid: "#4f7da8", muted: "#e8eef4", border: "#c5d4e0", text: "#3d5f7a" },
  { solid: "#7a5f9e", muted: "#efeaf4", border: "#d4c8e0", text: "#5c4878" },
  { solid: "#9a6b42", muted: "#f5ebe3", border: "#e0cfc0", text: "#6b4f38" },
  { solid: "#4a7a78", muted: "#e6efef", border: "#c0d4d4", text: "#355a58" },
  { solid: "#a05a5a", muted: "#f5eaea", border: "#e0c5c5", text: "#7a4545" },
  { solid: "#6b7a52", muted: "#eef0ea", border: "#d0d4c5", text: "#4f5c3d" },
];

export function getLifeGoalColor(lifeGoalId: number): GoalColor {
  return PALETTE[Math.abs(lifeGoalId) % PALETTE.length];
}

export function buildLifeGoalColorMap(
  goals: { id: number }[]
): Record<number, GoalColor> {
  const map: Record<number, GoalColor> = {};
  for (const g of goals) {
    map[g.id] = getLifeGoalColor(g.id);
  }
  return map;
}
