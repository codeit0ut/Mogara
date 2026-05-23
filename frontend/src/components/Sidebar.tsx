import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconUser } from "./icons";
import { MogaraBrandHint } from "./MogaraBrandHint";
import { MogaraLogoWell } from "./MogaraLogoWell";
import {
  getActiveModule,
  getActiveSubLinks,
  moduleHasSubnav,
  NAV_MODULES,
  type NavModule,
} from "../navigation";

function railIconWrapClass(active: boolean) {
  return active
    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-deep)]"
    : "text-[var(--color-ink-faint)] group-hover/nav:bg-[var(--color-hover-surface)] group-hover/nav:text-[var(--color-ink-secondary)]";
}

function subLinkClass(active: boolean) {
  return active
    ? "bg-[var(--color-green-muted)] font-medium text-[var(--color-ink)] before:absolute before:left-1.5 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-green-vein)]"
    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-hover-surface)] hover:text-[var(--color-ink)]";
}

function PrimaryRail({ activeModule }: { activeModule: NavModule | undefined }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const profileActive = pathname === "/profile";

  return (
    <aside
      className="group/rail z-20 flex h-full w-14 shrink-0 flex-col overflow-hidden border-r border-[var(--color-border-subtle)] bg-[var(--color-white-petal)] transition-[width] duration-300 ease-[var(--ease-mogara)] hover:w-[168px]"
      aria-label="Main navigation"
    >
      <div className="flex h-full w-[168px] min-w-[168px] flex-col">
        {/* Brand — logo hover opens floating hint card (portal) */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--color-border)] px-2.5">
          <MogaraBrandHint>
            <MogaraLogoWell size={36} animate />
          </MogaraBrandHint>
          <p className="min-w-0 truncate font-display text-base font-semibold leading-tight text-white-bloom opacity-0 transition-opacity duration-300 group-hover/rail:opacity-100">
            Mogara
          </p>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-2">
          {NAV_MODULES.map((mod) => {
            const Icon = mod.icon;
            const active = activeModule?.id === mod.id;
            return (
              <NavLink
                key={mod.id}
                to={mod.defaultTo}
                title={mod.railLabel}
                className={`group/nav relative flex h-10 items-center gap-3 rounded-[var(--radius-md)] px-1.5 transition-colors ${
                    active
                    ? "text-gold before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-[var(--color-primary-deep)] before:opacity-0 group-hover/rail:before:opacity-100"
                    : "text-[var(--color-ink-faint)]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors duration-150 ${railIconWrapClass(active)}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span
                  className={`truncate text-[13px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 ${
                    active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {mod.railLabel}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--color-border-subtle)] p-2">
          <NavLink
            to="/profile"
            title={user ? `@${user.username}` : "Profile"}
            className={`group/nav relative flex h-10 items-center gap-3 rounded-[var(--radius-md)] px-1.5 transition-colors ${
              profileActive
                ? "text-gold"
                : "text-[var(--color-ink-faint)]"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors duration-150 ${railIconWrapClass(profileActive)}`}
            >
              <IconUser className="h-[18px] w-[18px]" />
            </span>
            <span
              className={`truncate text-[13px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 ${
                profileActive
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              {user ? `@${user.username}` : "Profile"}
            </span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

function weekSubnavTo(path: string, pathname: string, search: string) {
  if (pathname.startsWith("/week") && path.startsWith("/week") && search) {
    return { pathname: path, search };
  }
  return path;
}

function SecondaryPanel({ module }: { module: NavModule }) {
  const { pathname, search } = useLocation();
  const children = module.children ?? [];

  return (
    <aside
      className="flex h-full w-[220px] shrink-0 flex-col border-r border-[var(--color-border-green)] bg-[linear-gradient(180deg,var(--color-white-paper)_0%,var(--color-white-cream)_100%)]"
      aria-label={`${module.panelTitle} navigation`}
    >
      <div className="border-b border-[var(--color-border)] px-4 py-4">
        <p className="text-[10px] font-semibold tracking-widest text-[var(--color-green-bright)]">
          SECTION
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
          {module.panelTitle}
        </h2>
        {module.panelHint && (
          <p className="mt-1 text-[11px] leading-snug text-[var(--color-ink-muted)]">
            {module.panelHint}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {children.map(({ to, label, hint, end }) => (
          <NavLink
            key={to}
            to={weekSubnavTo(to, pathname, search)}
            end={end}
            className={({ isActive }) =>
              `relative block rounded-[var(--radius-md)] px-3 py-2.5 transition-colors ${subLinkClass(isActive)}`
            }
          >
            <span className="block text-[13px] font-medium">{label}</span>
            {hint && (
              <span className="mt-0.5 block text-[10px] leading-snug opacity-80">
                {hint}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const activeModule = getActiveModule(pathname);
  const subnavOpen = Boolean(activeModule && moduleHasSubnav(activeModule));

  return (
    <div className="hidden shrink-0 md:flex">
      <PrimaryRail activeModule={activeModule} />
      {subnavOpen && activeModule && <SecondaryPanel module={activeModule} />}
    </div>
  );
}

export function MobileNav() {
  const { pathname, search } = useLocation();
  const activeModule = getActiveModule(pathname);
  const subLinks = getActiveSubLinks(pathname);

  return (
    <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-white-petal)] md:hidden">
      <nav className="flex gap-1 overflow-x-auto px-2 py-2">
        {NAV_MODULES.map((mod) => {
          const active = activeModule?.id === mod.id;
          return (
            <NavLink
              key={mod.id}
              to={mod.defaultTo}
              className={`shrink-0 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-deep)]"
                  : "text-[var(--color-ink-faint)]"
              }`}
            >
              {mod.railLabel}
            </NavLink>
          );
        })}
      </nav>
      {subLinks.length > 0 && (
        <nav className="flex gap-1 overflow-x-auto border-t border-[var(--color-border)]/60 px-2 py-1.5">
          {subLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={weekSubnavTo(to, pathname, search)}
              end={end}
              className={({ isActive }) =>
                `shrink-0 rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-hover-surface)] text-[var(--color-ink)]"
                    : "text-[var(--color-ink-faint)]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
