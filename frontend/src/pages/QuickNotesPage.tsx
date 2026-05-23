import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { TrashButton } from "../components/TrashButton";
import type { QuickNote } from "../api/types";
import { IconNotes } from "../components/icons";
import { useToast } from "../components/Toast";
import { runAction } from "../utils/runAction";
import { EMPTY_HINTS, PAGE_HINTS } from "../copy/hints";
import { formatDisplayDate, shiftDate, todayLocal } from "../utils/dates";
import {
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Muted,
  Panel,
  PillGroup,
} from "../components/ui";

export function QuickNotesPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date") ?? todayLocal();
  const isToday = date === todayLocal();

  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [newNote, setNewNote] = useState("");

  const setDate = (d: string) => setSearchParams({ date: d });

  const load = useCallback(async () => {
    const n = await api.quickNotes.list(date);
    setNotes(n);
  }, [date]);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load notes"));
  }, [load, toast]);

  async function addNote() {
    if (!newNote.trim()) return;
    await runAction(
      toast,
      async () => {
        await api.quickNotes.create(newNote.trim(), date);
        setNewNote("");
        await load();
      },
      { success: "Note added" }
    );
  }

  async function removeNote(id: number) {
    await runAction(toast, () => api.quickNotes.remove(id).then(load), {
      success: "Note removed",
    });
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title={isToday ? "Quick notes" : formatDisplayDate(date)}
        subtitle={PAGE_HINTS.quickNotes}
        icon={<IconNotes className="h-4 w-4" />}
      >
        <PillGroup>
          <Button variant="ghost" size="sm" onClick={() => setDate(shiftDate(date, -1))}>
            ←
          </Button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => setDate(todayLocal())}>
              Today
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDate(shiftDate(date, 1))}>
            →
          </Button>
        </PillGroup>
      </ContentHeader>

      <Panel className="max-w-2xl">
        <Muted className="mb-4 block text-xs">
          Capture passing thoughts for {isToday ? "today" : formatDisplayDate(date)}.
        </Muted>
        <div className="flex flex-col gap-4">
          {notes.length === 0 ? (
            <EmptyState title="No notes" hint={EMPTY_HINTS.noNotes} />
          ) : (
            <ul className="space-y-2">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="group flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink-secondary)]"
                >
                  <span className="flex-1">{n.body}</span>
                  <TrashButton
                    label="Remove note"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeNote(n.id)}
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2">
            <Input
              className="min-w-0 flex-1"
              placeholder="A thought…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <Button variant="soft" className="shrink-0" onClick={addNote}>
              Add
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
