import { Outlet, useLocation } from "react-router-dom";
import { getRouteMeta } from "../navigation";
import { MogaraLogoWell } from "./MogaraLogoWell";
import { MomentumQuiet } from "./MomentumQuiet";
import { MobileNav, Sidebar } from "./Sidebar";

export function Layout() {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname);

  return (
    <div className="flex h-full min-h-screen bg-[var(--color-bg)]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex h-12 shrink-0 items-center gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-white-paper)] px-3 md:gap-3 md:px-5">
          <div className="flex min-w-0 shrink-0 items-center gap-2 text-sm max-md:max-w-[38%] lg:max-w-none">
            <span className="font-display text-base font-semibold tracking-wide text-white-bloom">
              Mogara
            </span>
            <span className="text-[var(--color-ink-muted)]">/</span>
            <span className="truncate text-[var(--color-ink-caption)]">{meta.section}</span>
            <span className="hidden text-[var(--color-ink-muted)] md:inline">/</span>
            <span className="hidden truncate font-medium text-[var(--color-ink)] md:inline">
              {meta.title}
            </span>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 items-stretch py-1.5">
            <MomentumQuiet variant="featured" />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div title="Mogara">
              <MogaraLogoWell size={32} className="rounded-full" />
            </div>
          </div>
        </header>

        <MobileNav />

        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
          <div
            key={location.pathname + location.search}
            className="animate-[fadeIn_0.45s_var(--ease-mogara)] px-4 py-6 md:px-7 md:py-7"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
