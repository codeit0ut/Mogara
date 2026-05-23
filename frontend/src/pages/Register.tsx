import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { MogaraLogoWell } from "../components/MogaraLogoWell";
import { useToast } from "../components/Toast";
import { Button, Input, Panel, Textarea } from "../components/ui";
import { LABEL_HINTS, PAGE_HINTS } from "../copy/hints";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [customPhrase, setCustomPhrase] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasUsers, setHasUsers] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.auth
      .status()
      .then((s) => {
        setSuggestions(s.phrase_suggestions);
        setHasUsers(s.has_users);
        if (s.phrase_suggestions.length) {
          setPassword((prev) => prev || s.phrase_suggestions[0]);
        }
      })
      .catch(() => toast.error("Could not load registration options"))
      .finally(() => setStatusLoading(false));
  }, [toast]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <Panel className="w-full max-w-lg" highlight>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <MogaraLogoWell size={48} />
          <div>
            <h1 className="font-display text-xl font-semibold text-white-bloom">
              {hasUsers ? "Join Mogara" : "Begin your Mogara"}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {hasUsers ? PAGE_HINTS.register : PAGE_HINTS.registerFirst}
            </p>
          </div>
        </div>

        {statusLoading ? (
          <p className="text-center text-sm text-[var(--color-ink-muted)]">Loading…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--color-ink-caption)]">Username</span>
              <p className="mb-1.5 text-xs text-[var(--color-ink-muted)]">{LABEL_HINTS.username}</p>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="letters, numbers, underscores"
                required
              />
            </label>

            <div className="space-y-2">
              <span className="block text-sm text-[var(--color-ink-caption)]">
                Motivating phrase
              </span>
              <p className="text-xs text-[var(--color-ink-muted)]">{LABEL_HINTS.motivatingPhrase}</p>

              {!customPhrase && (
                <ul className="space-y-2">
                  {suggestions.map((phrase) => {
                    const selected = password === phrase;
                    return (
                      <li key={phrase}>
                        <button
                          type="button"
                          onClick={() => setPassword(phrase)}
                          className={`w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition-colors ${
                            selected
                              ? "border-[var(--color-primary-deep)] bg-[var(--color-primary-muted)] text-[var(--color-ink)]"
                              : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-green)] hover:bg-[var(--color-hover-surface)]"
                          }`}
                        >
                          {phrase}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                type="button"
                onClick={() => {
                  setCustomPhrase((v) => !v);
                  if (!customPhrase) setPassword("");
                }}
                className="text-xs font-medium text-[var(--color-primary-deep)] hover:underline"
              >
                {customPhrase ? "Use a suggested phrase" : "Write my own phrase"}
              </button>

              {customPhrase && (
                <Textarea
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rows={3}
                  placeholder="A sentence you can speak aloud when you open Mogara…"
                  required
                />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={busy || !password.trim()}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[var(--color-primary-deep)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Panel>
    </div>
  );
}
