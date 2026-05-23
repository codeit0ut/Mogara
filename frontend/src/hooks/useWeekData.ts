import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import type { DirectionState, ShortTermGoal, WeeklyGoal, WeeklyReview } from "../api/types";
import { useToast } from "../components/Toast";
import { runAction } from "../utils/runAction";
import {
  isoToDate,
  shiftWeekStart,
  weekBounds,
  weeklyGoalInWeek,
  weekRangeForApi,
} from "../utils/dates";

type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function useWeekData() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(1);
  const [bounds, setBounds] = useState(weekBounds());
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [shortTermGoals, setShortTermGoals] = useState<ShortTermGoal[]>([]);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [wgTitle, setWgTitle] = useState("");
  const [wgShortTermId, setWgShortTermId] = useState<number | "">("");
  const [draft, setDraft] = useState<Partial<WeeklyReview>>({});
  const [direction, setDirection] = useState<DirectionState | "">("");

  const weekStartDate = searchParams.get("week") ?? weekBounds(new Date(), weekStartsOn).startDate;

  const isCurrentWeek = useMemo(() => {
    const current = weekBounds(new Date(), weekStartsOn);
    return bounds.startDate === current.startDate;
  }, [bounds.startDate, weekStartsOn]);

  const setWeekStartDate = useCallback(
    (startDate: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("week", startDate);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const shiftWeek = useCallback(
    (delta: number) => {
      setWeekStartDate(shiftWeekStart(weekStartDate, delta, weekStartsOn));
    },
    [setWeekStartDate, weekStartDate, weekStartsOn]
  );

  const goToThisWeek = useCallback(() => {
    setWeekStartDate(weekBounds(new Date(), weekStartsOn).startDate);
  }, [setWeekStartDate, weekStartsOn]);

  const load = useCallback(async () => {
    const settings = await api.settings.get();
    const startsOn = settings.week_starts_on as WeekStartsOn;
    setWeekStartsOn(startsOn);

    const b = weekBounds(isoToDate(weekStartDate), startsOn);
    setBounds(b);

    const [wg, reviews, st] = await Promise.all([
      api.weeklyGoals.list(),
      api.weeklyReviews.list(),
      api.shortTermGoals.list(),
    ]);
    setShortTermGoals(st);
    setWeeklyGoals(wg.filter((g) => weeklyGoalInWeek(g, b)));
    const match = reviews.find((r) =>
      weeklyGoalInWeek({ week_start: r.week_start, week_end: r.week_end }, b)
    );
    setReview(match ?? null);
    if (match) {
      setDraft(match);
      setDirection(match.direction_state ?? "");
    } else {
      setDraft({});
      setDirection("");
    }
  }, [weekStartDate]);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load week"));
  }, [load, toast]);

  async function addWeeklyGoal(): Promise<boolean> {
    if (!wgTitle.trim()) {
      toast.error("Enter a title for this week’s focus");
      return false;
    }
    if (wgShortTermId === "") {
      toast.error("Choose a short-term goal");
      return false;
    }
    return runAction(
      toast,
      async () => {
        const range = weekRangeForApi(bounds);
        await api.weeklyGoals.create({
          title: wgTitle.trim(),
          summary: null,
          ...range,
          short_term_goal_id: wgShortTermId,
          status: "active",
        });
        setWgTitle("");
        setWgShortTermId("");
        await load();
      },
      { success: "Weekly focus added" }
    );
  }

  async function saveReviewDraft() {
    if (review?.submitted_at) {
      toast.error("This review is submitted and locked. You can only edit casual notes.");
      return;
    }
    await runAction(
      toast,
      async () => {
        const payload = {
          ...draft,
          direction_state: direction || null,
          week_start: bounds.start,
          week_end: bounds.end,
        };
        if (review) {
          await api.weeklyReviews.update(review.id, payload);
        } else {
          await api.weeklyReviews.create(
            payload as WeeklyReview & { week_start: string; week_end: string }
          );
        }
        await load();
      },
      { success: "Review draft saved" }
    );
  }

  async function submitReview() {
    if (review?.submitted_at) {
      toast.error("This review is already submitted.");
      return;
    }
    await runAction(
      toast,
      async () => {
        const payload = {
          ...draft,
          direction_state: direction || null,
          week_start: bounds.start,
          week_end: bounds.end,
          submitted_at: new Date().toISOString(),
        };
        if (review) {
          await api.weeklyReviews.update(review.id, payload);
        } else {
          await api.weeklyReviews.create(
            payload as WeeklyReview & { week_start: string; week_end: string }
          );
        }
        await load();
      },
      { success: "Weekly review submitted — momentum updated" }
    );
  }

  async function saveCasualNotes() {
    if (!review) {
      toast.error("Save a draft or submit the review before adding casual notes.");
      return;
    }
    await runAction(
      toast,
      async () => {
        await api.weeklyReviews.update(review.id, {
          casual_notes: draft.casual_notes ?? null,
        });
        await load();
      },
      { success: "Casual notes saved" }
    );
  }

  return {
    bounds,
    weekStartDate,
    isCurrentWeek,
    shiftWeek,
    goToThisWeek,
    weeklyGoals,
    shortTermGoals,
    review,
    wgTitle,
    setWgTitle,
    wgShortTermId,
    setWgShortTermId,
    draft,
    setDraft,
    direction,
    setDirection,
    load,
    addWeeklyGoal,
    saveReviewDraft,
    submitReview,
    saveCasualNotes,
    submitted: Boolean(review?.submitted_at),
  };
}
