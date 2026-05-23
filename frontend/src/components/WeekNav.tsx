import { Badge, Button, PillGroup } from "./ui";

type WeekNavProps = {
  startDate: string;
  endDate: string;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onThisWeek: () => void;
};

export function WeekNav({
  startDate,
  endDate,
  isCurrentWeek,
  onPrev,
  onNext,
  onThisWeek,
}: WeekNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PillGroup>
        <Button variant="ghost" size="sm" onClick={onPrev} aria-label="Previous week">
          ←
        </Button>
        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={onThisWeek}>
            This week
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next week">
          →
        </Button>
      </PillGroup>
      <Badge tone="accent">
        {startDate} — {endDate}
      </Badge>
    </div>
  );
}
