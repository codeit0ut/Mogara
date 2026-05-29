/** Short explanations under page titles (ContentHeader subtitles). */
export const PAGE_HINTS = {
  coreTasks: "What you do today — each task links to this week's focus.",
  quickNotes: "Scratch pad for passing thoughts — not tied to goals or momentum.",
  noteTemplates:
    "Reusable Markdown layouts for core task notes — insert them when editing a task.",
  weeklyAnalysis:
    "Month view split into weeks — momentum delta and task completion at a glance.",
  monthlyAnalysis:
    "Year view split into months — momentum delta and task completion at a glance.",
  weeklyFocus: "Your main intention this week — tied to a short-term goal.",
  weeklyReflection:
    "Look back on the week — submit to save; only casual notes stay editable after.",
  weeklyReflectionPast: "Use ← → to browse past weeks and read what you submitted.",
  lifeAreas: "Broad themes (Health, Work, …) that group your life goals.",
  lifeGoals: "Long-term outcomes you're working toward — your north stars.",
  shortTermGoals: "Goals for the coming months — steps toward a life goal.",
  calendar: "Core tasks on a month view — click a day to open it in Today.",
  dashboard: "Momentum, where your energy went, and how you're trending.",
  settings: "Timezone and when your week starts — stored on this device.",
  profile: "Your account — sign out when you're done on this device.",
  login: "Sign in with your username and motivating phrase.",
  register: "Pick a username and a short phrase you'll remember — not a boring password.",
  registerFirst: "You're first here — create your account and choose a phrase that steadies you.",
} as const;

/** Under section titles inside panels. */
export const SECTION_HINTS = {
  yourAreas: "Name the parts of life you want to track.",
  lifeGoalsList: "Each goal gets a color used on tasks and weekly focus.",
  shortTermGoalsList: "Always linked to one life goal above it in the chain.",
  weeklyFocusList: "Add what matters this week — one focus per row.",
  reflection: "Wins, friction, weekly rhythm — casual notes stay editable after submit.",
  momentumTrend: "How your score moved over the range you pick.",
  lifeEnergy: "Share of completed tasks by life area (percent).",
  bloom: "Opens with momentum and your latest weekly rhythm.",
  time: "Used for task dates, week boundaries, and inactivity checks.",
  momentumTools: "Records a dip when yesterday had tasks but none were completed.",
} as const;

/** Sidebar section and link hints. */
export const NAV_HINTS = {
  coreTasks: "Daily tasks linked to weekly focus",
  quickNotes: "Freeform notes — no goal link",
  noteTemplates: "Saved note layouts for core tasks",
  weeklyAnalysis: "Month-by-month weekly momentum and task summary",
  monthlyAnalysis: "Year-by-year monthly momentum and task summary",
  weeklyFocus: "This week's priority",
  weeklyReflection: "Review the week",
  lifeAreas: "Themes for grouping goals",
  lifeGoals: "Long-term direction",
  shortTermGoals: "Near-term milestones",
  panelToday: "What you do day to day",
  panelWeek: "Plan and review the week",
  panelGoals: "Areas → life goals → short-term",
  panelCalendar: "Tasks across the month",
  panelDashboard: "Charts and summary stats",
  panelAnalysis: "Weekly and monthly momentum snapshots",
  panelSettings: "Time and preferences",
} as const;

export const EMPTY_HINTS = {
  noAreas: "Add an area to group life goals.",
  noLifeGoals: "Add a goal that points where you want your life to go.",
  noShortTerm: "Add a milestone tied to a life goal.",
  noWeeklyFocus: "Add this week's focus, linked to a short-term goal.",
  noCoreTasks: "Add one task that would make today feel intentional.",
  noNotes: "Jot down a thought — it won't affect momentum.",
  noTemplates: "Save a template from a task note, or add one here.",
  noSearch: "Try another word in the search box.",
  noEnergy: "Complete core tasks to see where your energy went.",
  noJourney: "Complete tasks or widen the time range to see the line.",
  noReflectionWeek: "Nothing saved for this week yet.",
  noWeeklyAnalysis: "No weeks found in this month.",
  noMonthlyAnalysis: "No months found for this year.",
} as const;

export const DIALOG_HINTS = {
  addCoreTask: "Pick a weekly focus — tasks never skip straight to life goals.",
  addWeeklyFocus: "Must link to a short-term goal (then life goal and area follow).",
  addLifeGoal: "Optional area tag; color carries through tasks and focus.",
  addShortTerm: "Choose which life goal this milestone supports.",
  noteTemplate: "Markdown supported — same format as core task notes.",
} as const;

export const LABEL_HINTS = {
  username: "Letters, numbers, and underscores only.",
  motivatingPhrase: "At least two words — a line you can say aloud.",
  timezone: "Dates and week boundaries use this zone.",
  weekStartsOn: "Which day begins your weekly focus and reflection.",
} as const;
