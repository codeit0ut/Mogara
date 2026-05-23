import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { LifeArea, LifeGoal, ShortTermGoal } from "../api/types";
import { useToast } from "../components/Toast";
import { runAction } from "../utils/runAction";

export function useGoalsData() {
  const toast = useToast();
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [shortTerm, setShortTerm] = useState<ShortTermGoal[]>([]);
  const [areaLabel, setAreaLabel] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalSummary, setGoalSummary] = useState("");
  const [goalAreaId, setGoalAreaId] = useState<number | "">("");
  const [stTitle, setStTitle] = useState("");
  const [stParent, setStParent] = useState<number | "">("");
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    const [a, g, s] = await Promise.all([
      api.lifeAreas.list(),
      api.lifeGoals.list(),
      api.shortTermGoals.list(),
    ]);
    setAreas(a);
    setGoals(g);
    setShortTerm(s);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load goals"));
  }, [toast]);

  async function addArea(label: string) {
    await runAction(
      toast,
      async () => {
        await api.lifeAreas.create(label);
        setAreaLabel("");
        await load();
      },
      { success: "Life area added" }
    );
  }

  async function removeArea(id: number, label: string) {
    await runAction(toast, () => api.lifeAreas.remove(id).then(load), {
      success: `Removed “${label}”`,
    });
  }

  return {
    areas,
    goals,
    shortTerm,
    areaLabel,
    setAreaLabel,
    goalTitle,
    setGoalTitle,
    goalSummary,
    setGoalSummary,
    goalAreaId,
    setGoalAreaId,
    stTitle,
    setStTitle,
    stParent,
    setStParent,
    editId,
    setEditId,
    load,
    addArea,
    removeArea,
  };
}
