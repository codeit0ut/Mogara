import { IconGoals } from "../../components/icons";
import { EMPTY_HINTS, PAGE_HINTS, SECTION_HINTS } from "../../copy/hints";
import { useGoalsData } from "../../hooks/useGoalsData";
import {
  Badge,
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Panel,
  SectionTitle,
} from "../../components/ui";

export function GoalsAreas() {
  const { areas, areaLabel, setAreaLabel, addArea, removeArea } = useGoalsData();

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Life areas"
        subtitle={PAGE_HINTS.lifeAreas}
        icon={<IconGoals className="h-4 w-4" />}
      />

      <Panel>
        <SectionTitle hint={SECTION_HINTS.yourAreas}>Your areas</SectionTitle>
        {areas.length === 0 ? (
          <EmptyState title="No areas yet" hint={EMPTY_HINTS.noAreas} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <Badge key={a.id} tone="neutral" className="!gap-2 !py-1.5 !pl-3 !pr-2">
                {a.label}
                <button
                  type="button"
                  className="ml-0.5 text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
                  aria-label={`Remove ${a.label}`}
                  onClick={() => removeArea(a.id, a.label)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="e.g. Health, Engineering…"
            value={areaLabel}
            onChange={(e) => setAreaLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && areaLabel.trim()) {
                e.preventDefault();
                addArea(areaLabel.trim());
              }
            }}
          />
          <Button
            variant="primary"
            className="shrink-0"
            onClick={() => areaLabel.trim() && addArea(areaLabel.trim())}
          >
            Add area
          </Button>
        </div>
      </Panel>
    </div>
  );
}
