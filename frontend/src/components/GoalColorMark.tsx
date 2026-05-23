import { getLifeGoalColor } from "../utils/goalColors";

type GoalColorMarkProps = {
  lifeGoalId: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = { sm: "h-2 w-2", md: "h-2.5 w-2.5", lg: "h-9 w-1" };

/** Dot or vertical stripe for a life goal accent */
export function GoalColorMark({
  lifeGoalId,
  size = "md",
  className = "",
}: GoalColorMarkProps) {
  const color = getLifeGoalColor(lifeGoalId);
  if (size === "lg") {
    return (
      <span
        className={`shrink-0 rounded-sm ${SIZES.lg} ${className}`}
        style={{ backgroundColor: color.solid }}
        aria-hidden
      />
    );
  }
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${SIZES[size]} ${className}`}
      style={{ backgroundColor: color.solid }}
      aria-hidden
    />
  );
}
