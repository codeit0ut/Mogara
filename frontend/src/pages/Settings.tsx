import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { AppSettings } from "../api/types";
import { Select } from "../components/Select";
import { IconSettings } from "../components/icons";
import { useToast } from "../components/Toast";
import { LABEL_HINTS, PAGE_HINTS, SECTION_HINTS } from "../copy/hints";
import { Button, Divider, Label, ContentHeader, Panel, SectionTitle } from "../components/ui";
import { runAction } from "../utils/runAction";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    api.settings
      .get()
      .then(setSettings)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load settings"));
  }, [toast]);

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Settings"
        subtitle={PAGE_HINTS.settings}
        icon={<IconSettings className="h-4 w-4" />}
      />

      <Panel>
        <SectionTitle hint={SECTION_HINTS.time}>Time</SectionTitle>
        <div className="space-y-5">
          <div>
            <Label>Timezone</Label>
            <p className="mb-1.5 text-xs text-[var(--color-ink-muted)]">{LABEL_HINTS.timezone}</p>
            <Select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Week starts on</Label>
            <p className="mb-1.5 text-xs text-[var(--color-ink-muted)]">{LABEL_HINTS.weekStartsOn}</p>
            <Select
              value={settings.week_starts_on}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  week_starts_on: Number(e.target.value),
                })
              }
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={6}>Saturday</option>
            </Select>
          </div>
        </div>
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() =>
              runAction(
                toast,
                async () => {
                  const updated = await api.settings.update({
                    timezone: settings.timezone,
                    week_starts_on: settings.week_starts_on,
                  });
                  setSettings(updated);
                },
                { success: "Preferences saved" }
              )
            }
          >
            Save preferences
          </Button>
        </div>
      </Panel>

      <Divider />

      <Panel>
        <SectionTitle hint={SECTION_HINTS.momentumTools}>Momentum</SectionTitle>
        <Button
          variant="soft"
          onClick={async () => {
            try {
              const ev = await api.momentum.processInactivity();
              if (ev) {
                toast.info(`Recorded inactivity (${ev.change}) for ${ev.local_date}`);
              } else {
                toast.info("No inactivity recorded for yesterday");
              }
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Inactivity check failed");
            }
          }}
        >
          Check yesterday
        </Button>
      </Panel>
    </div>
  );
}
