import type { ComponentType } from "react";
import {
  IconAnalysis,
  IconCalendar,
  IconGoals,
  IconInsights,
  IconSettings,
  IconToday,
  IconWeek,
} from "./components/icons";
import { NAV_HINTS } from "./copy/hints";

export type NavChild = {
  to: string;
  label: string;
  hint?: string;
  end?: boolean;
};

export type NavModule = {
  id: string;
  railLabel: string;
  panelTitle: string;
  panelHint?: string;
  icon: ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
  defaultTo: string;
  children?: NavChild[];
};

/** Order: Today → Week → Goals → Calendar → Dashboard → Settings */
export const NAV_MODULES: NavModule[] = [
  {
    id: "today",
    railLabel: "Today",
    panelTitle: "Core tasks",
    panelHint: NAV_HINTS.panelToday,
    icon: IconToday,
    match: (p) => p === "/" || p === "/notes" || p === "/templates",
    defaultTo: "/",
    children: [
      { to: "/", label: "Core tasks", hint: NAV_HINTS.coreTasks, end: true },
      { to: "/notes", label: "Quick notes", hint: NAV_HINTS.quickNotes },
      { to: "/templates", label: "Templates", hint: NAV_HINTS.noteTemplates },
    ],
  },
  {
    id: "week",
    railLabel: "Week",
    panelTitle: "Week",
    panelHint: NAV_HINTS.panelWeek,
    icon: IconWeek,
    match: (p) => p.startsWith("/week"),
    defaultTo: "/week/focus",
    children: [
      { to: "/week/focus", label: "Weekly focus", hint: NAV_HINTS.weeklyFocus },
      {
        to: "/week/reflection",
        label: "Weekly reflection",
        hint: NAV_HINTS.weeklyReflection,
      },
    ],
  },
  {
    id: "goals",
    railLabel: "Goals",
    panelTitle: "Goals",
    panelHint: NAV_HINTS.panelGoals,
    icon: IconGoals,
    match: (p) => p.startsWith("/goals"),
    defaultTo: "/goals/areas",
    children: [
      { to: "/goals/areas", label: "Life areas", hint: NAV_HINTS.lifeAreas, end: true },
      { to: "/goals/life", label: "Life goals", hint: NAV_HINTS.lifeGoals },
      {
        to: "/goals/short-term",
        label: "Short-term goals",
        hint: NAV_HINTS.shortTermGoals,
      },
    ],
  },
  {
    id: "analysis",
    railLabel: "Analysis",
    panelTitle: "Analysis",
    panelHint: NAV_HINTS.panelAnalysis,
    icon: IconAnalysis,
    match: (p) => p.startsWith("/analysis"),
    defaultTo: "/analysis/weekly",
    children: [
      {
        to: "/analysis/weekly",
        label: "Weekly analysis",
        hint: NAV_HINTS.weeklyAnalysis,
      },
      {
        to: "/analysis/monthly",
        label: "Monthly analysis",
        hint: NAV_HINTS.monthlyAnalysis,
      },
    ],
  },
  {
    id: "calendar",
    railLabel: "Calendar",
    panelTitle: "Calendar",
    panelHint: NAV_HINTS.panelCalendar,
    icon: IconCalendar,
    match: (p) => p.startsWith("/calendar"),
    defaultTo: "/calendar",
  },
  {
    id: "dashboard",
    railLabel: "Dashboard",
    panelTitle: "Dashboard",
    panelHint: NAV_HINTS.panelDashboard,
    icon: IconInsights,
    match: (p) => p.startsWith("/insights"),
    defaultTo: "/insights",
  },
  {
    id: "settings",
    railLabel: "Settings",
    panelTitle: "Settings",
    panelHint: NAV_HINTS.panelSettings,
    icon: IconSettings,
    match: (p) => p.startsWith("/settings"),
    defaultTo: "/settings",
  },
];

export function getActiveModule(pathname: string): NavModule | undefined {
  return NAV_MODULES.find((m) => m.match(pathname));
}

export function moduleHasSubnav(module: NavModule): boolean {
  return (module.children?.length ?? 0) > 0;
}

const ROUTE_TITLES: Record<string, { section: string; title: string }> = {
  "/": { section: "Core tasks", title: "Core tasks" },
  "/notes": { section: "Core tasks", title: "Quick notes" },
  "/templates": { section: "Core tasks", title: "Note templates" },
  "/week/focus": { section: "Week", title: "Weekly focus" },
  "/week/reflection": { section: "Week", title: "Weekly reflection" },
  "/goals/areas": { section: "Goals", title: "Life areas" },
  "/goals/life": { section: "Goals", title: "Life goals" },
  "/goals/short-term": { section: "Goals", title: "Short-term goals" },
  "/analysis/weekly": { section: "Analysis", title: "Weekly analysis" },
  "/analysis/monthly": { section: "Analysis", title: "Monthly analysis" },
  "/calendar": { section: "Calendar", title: "Calendar" },
  "/insights": { section: "Dashboard", title: "Dashboard" },
  "/settings": { section: "Settings", title: "Settings" },
  "/profile": { section: "Account", title: "Profile" },
};

export function getRouteMeta(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const mod = getActiveModule(pathname);
  if (mod) return { section: mod.panelTitle, title: mod.railLabel };
  return { section: "Life Tracker", title: "Home" };
}

export function getActiveSubLinks(pathname: string): NavChild[] {
  const mod = getActiveModule(pathname);
  return mod?.children ?? [];
}
