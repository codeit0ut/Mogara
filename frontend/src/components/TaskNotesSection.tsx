import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import type { NoteTemplate } from "../api/types";
import { Dialog } from "./Dialog";
import { Select } from "./Select";
import { useToast } from "./Toast";
import { runAction } from "../utils/runAction";
import { Button, Input, Label, Textarea } from "./ui";

type TaskNotesSectionProps = {
  value: string | null;
  onSave: (notes: string | null) => void | Promise<void>;
};

function wrapSelection(text: string, start: number, end: number, before: string, after = before) {
  const selected = text.slice(start, end);
  const inner = selected || "text";
  const wrapped = before + inner + after;
  return {
    next: text.slice(0, start) + wrapped + text.slice(end),
    selectStart: start + before.length,
    selectEnd: start + before.length + inner.length,
  };
}

function prefixLines(text: string, start: number, end: number, prefix: string) {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", end);
  const blockEnd = lineEnd === -1 ? text.length : lineEnd;
  const block = text.slice(lineStart, blockEnd);
  const lines = block.split("\n");
  const prefixed = lines
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join("\n");
  const next = text.slice(0, lineStart) + prefixed + text.slice(blockEnd);
  return { next, selectStart: lineStart, selectEnd: lineStart + prefixed.length };
}

function ToolbarButton({
  label,
  title,
  onClick,
}: {
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="flex h-7 min-w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-white-paper)] px-1.5 text-xs font-medium text-[var(--color-ink-secondary)] transition-colors hover:border-[var(--color-border-green)] hover:bg-[var(--color-white-petal)] hover:text-[var(--color-ink)]"
    >
      {label}
    </button>
  );
}

export function TaskNotesSection({ value, onSave }: TaskNotesSectionProps) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [templatePick, setTemplatePick] = useState("");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const display = value?.trim() ?? "";

  const loadTemplates = useCallback(async () => {
    try {
      const rows = await api.noteTemplates.list();
      setTemplates(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load templates");
    }
  }, [toast]);

  useEffect(() => {
    if (editing) void loadTemplates();
  }, [editing, loadTemplates]);

  function startEdit() {
    setDraft(value ?? "");
    setTemplatePick("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft("");
    setTemplatePick("");
    setSaveTemplateOpen(false);
    setTemplateName("");
  }

  async function save() {
    const trimmed = draft.trim();
    setSaving(true);
    try {
      await onSave(trimmed || null);
      setEditing(false);
      setDraft("");
      setTemplatePick("");
    } finally {
      setSaving(false);
    }
  }

  function applyWrap(before: string, after?: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { next, selectStart, selectEnd } = wrapSelection(
      draft,
      el.selectionStart,
      el.selectionEnd,
      before,
      after ?? before
    );
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectStart, selectEnd);
    });
  }

  function applyLinePrefix(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { next, selectStart, selectEnd } = prefixLines(
      draft,
      el.selectionStart,
      el.selectionEnd,
      prefix
    );
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectStart, selectEnd);
    });
  }

  function insertTemplate(templateId: string) {
    if (!templateId) return;
    const template = templates.find((t) => t.id === Number(templateId));
    if (!template) return;

    if (draft.trim()) {
      const ok = window.confirm(
        "Replace current note text with this template? Cancel keeps your draft."
      );
      if (!ok) {
        setTemplatePick("");
        return;
      }
    }
    setDraft(template.body);
    setTemplatePick("");
    textareaRef.current?.focus();
  }

  function openSaveTemplate() {
    if (!draft.trim()) {
      toast.error("Write some note content before saving a template");
      return;
    }
    setTemplateName("");
    setSaveTemplateOpen(true);
  }

  async function submitSaveTemplate() {
    const title = templateName.trim();
    if (!title) {
      toast.error("Enter a template name");
      return;
    }
    await runAction(
      toast,
      async () => {
        await api.noteTemplates.create({ title, body: draft.trim() });
        setSaveTemplateOpen(false);
        setTemplateName("");
        await loadTemplates();
      },
      { success: "Template saved" }
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-display text-base font-semibold tracking-tight text-[var(--color-ink)]">
          Notes
        </span>
        {!editing && (
          <Button variant="ghost" size="sm" type="button" onClick={startEdit}>
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          {templates.length > 0 && (
            <div>
              <Label>Use template</Label>
              <Select
                value={templatePick}
                onChange={(e) => {
                  const id = e.target.value;
                  setTemplatePick(id);
                  insertTemplate(id);
                }}
              >
                <option value="">Choose a saved template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div
            className="flex flex-wrap gap-1"
            role="toolbar"
            aria-label="Formatting"
          >
            <ToolbarButton label="B" title="Bold" onClick={() => applyWrap("**")} />
            <ToolbarButton label="I" title="Italic" onClick={() => applyWrap("*")} />
            <ToolbarButton label="H" title="Subheading" onClick={() => applyLinePrefix("### ")} />
            <ToolbarButton
              label="•"
              title="Bullet list"
              onClick={() => applyLinePrefix("- ")}
            />
            <ToolbarButton label="`" title="Code" onClick={() => applyWrap("`")} />
          </div>
          <Textarea
            ref={textareaRef}
            rows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write notes in Markdown…"
            className="min-h-[8rem] font-mono text-[13px]"
          />
          <p className="text-[11px] text-[var(--color-ink-muted)]">
            Supports **bold**, *italic*, lists, and ### subheadings.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={saving}
              onClick={openSaveTemplate}
            >
              Save as template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={saving}
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="task-notes-document">
          {display ? (
            <div className="task-notes-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {display}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-ink-disabled)]">No notes yet.</p>
          )}
        </div>
      )}

      <Dialog
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        title="Save as template"
        description="Reuse this note structure on other core tasks."
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setSaveTemplateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => void submitSaveTemplate()}>
              Save template
            </Button>
          </>
        }
      >
        <div>
          <Label>Template name</Label>
          <Input
            autoFocus
            value={templateName}
            placeholder="e.g. Daily standup"
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submitSaveTemplate()}
          />
        </div>
      </Dialog>
    </div>
  );
}
