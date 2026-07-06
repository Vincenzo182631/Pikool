"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleRow } from "@/components/settings/toggle-row";
import { useMe } from "@/hooks/use-auth";
import { useUpdateSettings } from "@/hooks/use-settings";
import { VISIBILITY_OPTIONS } from "@/lib/validation/settings";

const selectClass =
  "flex h-10 w-full max-w-xs rounded-2xl border border-border/60 bg-secondary/60 clay-inset px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const VIS_LABELS: Record<string, string> = {
  PUBLIC: "Public — anyone can view",
  FOLLOWERS: "Followers only",
  PRIVATE: "Private — only you",
};

export default function PrivacySettingsPage() {
  const { data: me } = useMe();
  const update = useUpdateSettings();
  const s = me?.settings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5 border-b border-border pb-4">
          <Label htmlFor="visibility">Profile visibility</Label>
          <select
            id="visibility"
            className={selectClass}
            value={s?.profileVisibility ?? "PUBLIC"}
            onChange={(e) => update.mutate({ profileVisibility: e.target.value as (typeof VISIBILITY_OPTIONS)[number] })}
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {VIS_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
        <div className="py-0">
          <ToggleRow
            label="Show location"
            description="Display your city and country on your player card."
            checked={s?.showLocation ?? true}
            onChange={(v) => update.mutate({ showLocation: v })}
          />
          <ToggleRow
            label="Show statistics"
            description="Display your rating, record, and streaks publicly."
            checked={s?.showStats ?? true}
            onChange={(v) => update.mutate({ showStats: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
