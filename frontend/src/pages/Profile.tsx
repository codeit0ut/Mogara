import { useNavigate } from "react-router-dom";
import { PAGE_HINTS } from "../copy/hints";
import { ContentHeader, Panel, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { IconUser } from "../components/icons";

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-lg">
      <ContentHeader
        title="Profile"
        subtitle={PAGE_HINTS.profile}
        icon={<IconUser className="h-5 w-5" />}
      />

      <Panel>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-[var(--color-ink-caption)]">Username</dt>
            <dd className="mt-1 font-medium text-[var(--color-ink)]">@{user?.username}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-caption)]">Motivating phrase</dt>
            <dd className="mt-1 text-[var(--color-ink-muted)]">
              The line you chose at sign-up — stored hashed, never shown again.
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </Panel>
    </div>
  );
}
