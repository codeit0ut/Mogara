import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MogaraLogoWell } from "../components/MogaraLogoWell";
import { Button, Input, Panel } from "../components/ui";
import { PAGE_HINTS } from "../copy/hints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from?.startsWith("/login") ||
    (location.state as { from?: string } | null)?.from?.startsWith("/register")
      ? "/"
      : (location.state as { from?: string } | null)?.from ?? "/";

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <Panel className="w-full max-w-md" highlight>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <MogaraLogoWell size={48} />
          <div>
            <h1 className="font-display text-xl font-semibold text-white-bloom">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{PAGE_HINTS.login}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--color-ink-caption)]">Username</span>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--color-ink-caption)]">
              Motivating phrase
            </span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-[var(--color-primary-deep)] hover:underline"
          >
            Create your space
          </Link>
        </p>
      </Panel>
    </div>
  );
}
