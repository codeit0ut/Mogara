import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import type { NoteTemplate } from "../api/types";
import { Dialog } from "../components/Dialog";
import { TrashButton } from "../components/TrashButton";
import { IconTemplate } from "../components/icons";
import { useToast } from "../components/Toast";
import { runAction } from "../utils/runAction";
import { DIALOG_HINTS, EMPTY_HINTS, PAGE_HINTS } from "../copy/hints";
import {
  Button,
  ContentHeader,
  EmptyState,
  Input,
  Label,
  Panel,
  Textarea,
} from "../components/ui";

type TemplateDraft = { title: string; body: string };

const emptyDraft = (): TemplateDraft => ({ title: "", body: "" });

function previewLine(body: string) {
  const line = body.trim().split("\n").find((l) => l.trim());
  if (!line) return "Empty template";
  return line.length > 120 ? `${line.slice(0, 117)}…` : line;
}

export function NoteTemplatesPage() {
  const toast = useToast();
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const rows = await api.noteTemplates.list();
    setTemplates(rows);
  }, []);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load templates"));
  }, [load, toast]);

  function openCreate() {
    setEditingId(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  }

  function openEdit(template: NoteTemplate) {
    setEditingId(template.id);
    setDraft({ title: template.title, body: template.body });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptyDraft());
  }

  async function submitDialog() {
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title) {
      toast.error("Enter a template name");
      return;
    }
    if (!body) {
      toast.error("Enter template content");
      return;
    }

    if (editingId == null) {
      await runAction(
        toast,
        async () => {
          await api.noteTemplates.create({ title, body });
          closeDialog();
          await load();
        },
        { success: "Template created" }
      );
    } else {
      await runAction(
        toast,
        async () => {
          await api.noteTemplates.update(editingId, { title, body });
          closeDialog();
          await load();
        },
        { success: "Template updated" }
      );
    }
  }

  async function removeTemplate(id: number) {
    await runAction(toast, () => api.noteTemplates.remove(id).then(load), {
      success: "Template removed",
    });
    if (previewId === id) setPreviewId(null);
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Note templates"
        subtitle={PAGE_HINTS.noteTemplates}
        icon={<IconTemplate className="h-4 w-4" />}
      >
        <Button variant="primary" size="sm" onClick={openCreate}>
          Add template
        </Button>
      </ContentHeader>

      <Panel className="max-w-3xl">
        {templates.length === 0 ? (
          <EmptyState
            title="No templates yet"
            hint={EMPTY_HINTS.noTemplates}
            action={
              <Button variant="primary" size="sm" onClick={openCreate}>
                Add template
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => {
              const previewOpen = previewId === t.id;
              return (
                <li
                  key={t.id}
                  className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-white-paper)]"
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-ink)]">{t.title}</p>
                      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {previewLine(t.body)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setPreviewId(previewOpen ? null : t.id)}
                      >
                        {previewOpen ? "Hide" : "Preview"}
                      </Button>
                      <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(t)}>
                        Edit
                      </Button>
                      <TrashButton
                        label="Remove template"
                        onClick={() => void removeTemplate(t.id)}
                      />
                    </div>
                  </div>
                  {previewOpen && (
                    <div className="border-t border-[var(--color-border-subtle)] px-4 py-3">
                      <div className="task-notes-document">
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
                            {t.body}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingId == null ? "Add template" : "Edit template"}
        description={DIALOG_HINTS.noteTemplate}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => void submitDialog()}>
              {editingId == null ? "Create" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              autoFocus
              value={draft.title}
              placeholder="e.g. Daily standup"
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>
          <div>
            <Label>Content (Markdown)</Label>
            <Textarea
              rows={10}
              value={draft.body}
              placeholder={"### What is this\n- item one\n- item two"}
              className="min-h-[12rem] font-mono text-[13px]"
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
