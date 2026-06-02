import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { LifeGoal, WeeklyReview } from "../api/types";
import { GoalColorMark } from "../components/GoalColorMark";
import { EnergyChart } from "../components/EnergyChart";
import { getLifeGoalColor } from "../utils/goalColors";
import { MomentumChart } from "../components/MomentumChart";
import { MogaraBloomMomentum } from "../components/MogaraBloomMomentum";
import { calmFromReviews } from "../utils/directionCalm";
import {
  filterPointsByRange,
  MOMENTUM_RANGE_OPTIONS,
  rangeCutoffIso,
  type ChartRange,
} from "../utils/chartRange";
import { IconInsights } from "../components/icons";
import { PAGE_HINTS, SECTION_HINTS } from "../copy/hints";
import { rhythmLabel } from "./week/weekConstants";
import {
  Badge,
  ContentHeader,
  Panel,
  SectionTitle,
  StatCard,
  TimeRangePills,
} from "../components/ui";

export function Insights() {
  const navigate = useNavigate();
  const [range, setRange] = useState<ChartRange>("ALL");
  const [energyRange, setEnergyRange] = useState<ChartRange>("ALL");
  const [journey, setJourney] = useState<{ value: number; occurred_at: string }[]>([]);
  const [energy, setEnergy] = useState<{ label: string; count: number }[]>([]);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [openReviewCount, setOpenReviewCount] = useState(0);
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [momentum, setMomentum] = useState(100);
  const [hoverGoal, setHoverGoal] = useState<LifeGoal | null>(null);

  useEffect(() => {
    Promise.all([
      api.analytics.momentumJourney(),
      api.momentum.current(),
      api.weeklyReviews.list(),
      api.lifeGoals.list(),
    ]).then(([j, m, r, g]) => {
      setJourney(j.map((p) => ({ value: p.value, occurred_at: p.occurred_at })));
      setMomentum(m.value);
      setReviews(r.filter((x) => x.submitted_at));
      setOpenReviewCount(r.filter((x) => !x.submitted_at).length);
      setGoals(g);
    });
  }, []);

  useEffect(() => {
    api.analytics.energy(rangeCutoffIso(energyRange)).then(setEnergy);
  }, [energyRange]);

  const journeyInRange = useMemo(
    () => filterPointsByRange(journey, range),
    [journey, range]
  );

  const latestDir = reviews[0]?.direction_state;
  const calm = useMemo(() => calmFromReviews(reviews), [reviews]);

  return (
    <div>
      <ContentHeader
        title="Dashboard"
        subtitle={PAGE_HINTS.dashboard}
        icon={<IconInsights className="h-4 w-4" />}
      />

      {/* Charts row — momentum left, life energy right (matched min height) */}
      <div className="mb-5 grid items-stretch gap-5 lg:grid-cols-2">
        <Panel className="flex flex-col">
          <SectionTitle
            action={
              <TimeRangePills
                value={range}
                onChange={(v) => setRange(v as ChartRange)}
                options={[...MOMENTUM_RANGE_OPTIONS]}
              />
            }
            hint={SECTION_HINTS.momentumTrend}
          >
            Momentum trend
          </SectionTitle>
          <div className="mb-3 flex gap-4 text-ui-caption text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-deep)]" />
              Momentum
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-green)]" />
              Direction
            </span>
          </div>
          <MomentumChart points={journeyInRange} />
        </Panel>

        <Panel className="flex flex-col">
          <SectionTitle
            action={
              <TimeRangePills
                value={energyRange}
                onChange={(v) => setEnergyRange(v as ChartRange)}
                options={[...MOMENTUM_RANGE_OPTIONS]}
              />
            }
            hint={SECTION_HINTS.lifeEnergy}
          >
            Life energy
          </SectionTitle>
          <EnergyChart data={energy} />
        </Panel>
      </div>

      {/* Bloom */}
      <Panel className="mb-5">
        <SectionTitle
          action={
            latestDir ? (
              <Badge tone="accent">{rhythmLabel(latestDir)}</Badge>
            ) : undefined
          }
          hint={SECTION_HINTS.bloom}
        >
          Bloom
        </SectionTitle>
        <MogaraBloomMomentum
          momentum={momentum}
          calm={calm}
          latestDirection={latestDir ? rhythmLabel(latestDir) : null}
          activeGoalId={hoverGoal?.id ?? null}
        />
        {goals.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {goals.map((g) => {
              const color = getLifeGoalColor(g.id);
              const active = hoverGoal?.id === g.id;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1 text-xs font-medium transition-colors"
                    style={
                      active
                        ? {
                            backgroundColor: color.solid,
                            borderColor: color.solid,
                            color: "var(--color-white-paper)",
                          }
                        : {
                            backgroundColor: color.muted,
                            borderColor: color.border,
                            color: color.text,
                          }
                    }
                    onMouseEnter={() => setHoverGoal(g)}
                    onMouseLeave={() => setHoverGoal(null)}
                  >
                    <GoalColorMark lifeGoalId={g.id} size="sm" />
                    {g.title}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {hoverGoal && (
          <p
            className="mt-3 rounded-[var(--radius-md)] border px-3 py-2 text-xs text-[var(--color-ink-secondary)]"
            style={{
              borderColor: getLifeGoalColor(hoverGoal.id).border,
              backgroundColor: getLifeGoalColor(hoverGoal.id).muted,
            }}
          >
            {hoverGoal.summary || hoverGoal.motivation || "A direction you're carrying."}
          </p>
        )}
      </Panel>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Momentum"
          value={momentum}
          hint="Your score right now"
          accent="primary"
          onView={() => navigate("/")}
        />
        <StatCard
          label="Reviews"
          value={reviews.length}
          hint="Weeks you closed out"
          accent="violet"
          onView={() => navigate("/week")}
        />
        <StatCard
          label="Life goals"
          value={goals.length}
          hint="Long-term goals in play"
          accent="green"
          onView={() => navigate("/goals")}
        />
        <StatCard
          label="Open reviews"
          value={openReviewCount}
          hint="Reflections still in draft"
          accent="primary"
        />
      </div>
    </div>
  );
}
