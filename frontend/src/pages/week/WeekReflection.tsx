import { WeekNav } from "../../components/WeekNav";
import { Select } from "../../components/Select";
import { IconWeek } from "../../components/icons";
import type { DirectionState } from "../../api/types";
import { useWeekData } from "../../hooks/useWeekData";
import {
  Badge,
  Button,
  ContentHeader,
  Input,
  Label,
  Panel,
  SectionTitle,
  Textarea,
} from "../../components/ui";
import { PAGE_HINTS, SECTION_HINTS } from "../../copy/hints";
import {
  CASUAL_NOTES_FIELD,
  REVIEW_LOCKED_FIELDS,
  WEEKLY_RHYTHM_FIELD,
  WEEKLY_RHYTHMS,
  rhythmOption,
} from "./weekConstants";

const fieldDisabled =
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--color-border)]";

export function WeekReflection() {
  const {
    bounds,
    isCurrentWeek,
    shiftWeek,
    goToThisWeek,
    review,
    draft,
    setDraft,
    direction,
    setDirection,
    saveReviewDraft,
    submitReview,
    saveCasualNotes,
    submitted,
  } = useWeekData();

  const hasReview = Boolean(review);
  const viewingPast = !isCurrentWeek;
  const selectedRhythm = rhythmOption(direction || undefined);

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Weekly reflection"
        subtitle={
          viewingPast ? PAGE_HINTS.weeklyReflectionPast : PAGE_HINTS.weeklyReflection
        }
        icon={<IconWeek className="h-4 w-4" />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <WeekNav
            startDate={bounds.startDate}
            endDate={bounds.endDate}
            isCurrentWeek={isCurrentWeek}
            onPrev={() => shiftWeek(-1)}
            onNext={() => shiftWeek(1)}
            onThisWeek={goToThisWeek}
          />
          {submitted && <Badge tone="success">Submitted · locked</Badge>}
          {viewingPast && !hasReview && <Badge tone="neutral">No reflection</Badge>}
        </div>
      </ContentHeader>

      <Panel highlight>
        <SectionTitle hint={SECTION_HINTS.reflection}>Reflection</SectionTitle>

        {viewingPast && !hasReview && (
          <p className="mb-6 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-ink-muted)]">
            No reflection saved for {bounds.startDate} — {bounds.endDate}. You can still
            write and submit one for this week, or use ← → to view another.
          </p>
        )}

        {submitted && (
          <p className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-border-green)] bg-[var(--color-green-muted)] px-3 py-2 text-xs leading-relaxed text-[var(--color-ink-secondary)]">
            Submitted reflections are read-only. You can still update{" "}
            <span className="font-medium">casual notes</span> below.
            {review?.submitted_at && (
              <>
                {" "}
                Submitted {new Date(review.submitted_at).toLocaleString()}.
              </>
            )}
          </p>
        )}

        <div>
          <Label>{WEEKLY_RHYTHM_FIELD.label}</Label>
          <p className="mb-2 text-xs leading-relaxed text-[var(--color-ink-muted)]">
            {WEEKLY_RHYTHM_FIELD.hint}
          </p>
          <Select
            className={fieldDisabled}
            disabled={submitted}
            value={direction}
            onChange={(e) => {
              const v = e.target.value;
              setDirection(v ? (v as DirectionState) : "");
            }}
          >
            <option value="">{WEEKLY_RHYTHM_FIELD.placeholder}</option>
            {WEEKLY_RHYTHMS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>

          {selectedRhythm ? (
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border-green)] bg-[var(--color-green-muted)] px-3 py-2.5">
              <p className="text-xs font-medium text-[var(--color-ink)]">
                {selectedRhythm.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-secondary)]">
                {selectedRhythm.description}
              </p>
            </div>
          ) : (
            <details className="mt-3 group">
              <summary className="cursor-pointer text-xs font-medium text-[var(--color-primary-deep)] hover:underline">
                What do the rhythm options mean?
              </summary>
              <ul className="mt-2 space-y-2 border-l-2 border-[var(--color-border-green)] pl-3">
                {WEEKLY_RHYTHMS.map((r) => (
                  <li key={r.value} className="text-xs">
                    <span className="font-medium text-[var(--color-ink)]">{r.label}</span>
                    <span className="text-[var(--color-ink-muted)]"> — </span>
                    <span className="text-[var(--color-ink-secondary)]">{r.description}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="mt-8 space-y-5">
          {REVIEW_LOCKED_FIELDS.map(({ key, label, short }) => (
            <div key={key}>
              <Label>{label}</Label>
              {short ? (
                <Input
                  className={fieldDisabled}
                  disabled={submitted}
                  readOnly={submitted}
                  value={(draft[key] as string) ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              ) : (
                <Textarea
                  className={fieldDisabled}
                  disabled={submitted}
                  readOnly={submitted}
                  rows={3}
                  value={(draft[key] as string) ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[var(--color-border)]/60 pt-6">
          <Label>{CASUAL_NOTES_FIELD.label}</Label>
          <p className="mb-2 text-xs text-[var(--color-ink-muted)]">
            Always editable — even after you submit.
          </p>
          <Textarea
            rows={3}
            value={(draft[CASUAL_NOTES_FIELD.key] as string) ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [CASUAL_NOTES_FIELD.key]: e.target.value }))
            }
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--color-border)]/60 pt-6">
          {!submitted ? (
            <>
              <Button variant="soft" onClick={saveReviewDraft}>
                Save draft
              </Button>
              <Button variant="primary" onClick={submitReview}>
                Submit review
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={saveCasualNotes}>
              Save casual notes
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}
