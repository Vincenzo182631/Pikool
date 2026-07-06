"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleRow } from "@/components/settings/toggle-row";
import { useMe } from "@/hooks/use-auth";
import { useUpdateSettings } from "@/hooks/use-settings";

export default function NotificationSettingsPage() {
  const { data: me } = useMe();
  const update = useUpdateSettings();
  const s = me?.settings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <ToggleRow
          label="Email notifications"
          description="Match invites, messages, and check-in alerts by email."
          checked={s?.emailNotifications ?? true}
          onChange={(v) => update.mutate({ emailNotifications: v })}
        />
        <ToggleRow
          label="Push notifications"
          description="Realtime alerts in your browser and on mobile."
          checked={s?.pushNotifications ?? true}
          onChange={(v) => update.mutate({ pushNotifications: v })}
        />
        <ToggleRow
          label="Product & marketing emails"
          description="Occasional news and tips from PicklePlay."
          checked={s?.marketingEmails ?? false}
          onChange={(v) => update.mutate({ marketingEmails: v })}
        />
      </CardContent>
    </Card>
  );
}
