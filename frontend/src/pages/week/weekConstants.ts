import type { DirectionState, WeeklyReview } from "../../api/types";

export type WeeklyRhythmOption = {
  value: DirectionState;
  /** Short name in the dropdown */
  label: string;
  /** What this choice means — shown under the select */
  description: string;
};

/** User-facing “weekly rhythm” choices (stored as `direction_state` on the server). */
export const WEEKLY_RHYTHMS: WeeklyRhythmOption[] = [
  {
    value: "wandering",
    label: "Drifting",
    description:
      "The week felt scattered — hard to see where your days were going.",
  },
  {
    value: "struggling",
    label: "Pushing through",
    description:
      "You kept showing up, but effort cost more than visible progress.",
  },
  {
    value: "moving",
    label: "In motion",
    description:
      "Steady steps forward — small or uneven, but the needle moved.",
  },
  {
    value: "grounded",
    label: "Anchored",
    description:
      "Priorities felt clear; you knew what mattered and stayed with it.",
  },
  {
    value: "flowing",
    label: "In flow",
    description:
      "Intent and action lined up — the week felt natural and focused.",
  },
];

export const WEEKLY_RHYTHM_FIELD = {
  label: "Weekly rhythm",
  hint: "How your days lined up with the life you're building — this also shapes your Mogara bloom.",
  placeholder: "Choose how the week felt…",
} as const;

export function rhythmOption(
  value: DirectionState | null | undefined
): WeeklyRhythmOption | undefined {
  if (!value) return undefined;
  return WEEKLY_RHYTHMS.find((r) => r.value === value);
}

export function rhythmLabel(value: DirectionState | null | undefined): string {
  return rhythmOption(value)?.label ?? "";
}

/** @deprecated use WEEKLY_RHYTHMS */
export const DIRECTIONS = WEEKLY_RHYTHMS.map(({ value, label }) => ({ value, label }));

export const REVIEW_LOCKED_FIELDS: {
  key: keyof WeeklyReview;
  label: string;
  short?: boolean;
}[] = [
  { key: "wins", label: "What genuinely went well?" },
  { key: "friction", label: "What repeatedly created resistance?" },
  { key: "learnings", label: "What did you learn this week?" },
  { key: "emotional_reflection", label: "When did you feel focused, alive, drained…?" },
  { key: "distractions", label: "What pulled you away from intentional living?" },
  { key: "direction_note", label: "Anything else about how the week felt?", short: true },
  { key: "next_week_intent", label: "What should matter next week?" },
];

export const CASUAL_NOTES_FIELD = {
  key: "casual_notes" as const,
  label: "Casual notes",
};
