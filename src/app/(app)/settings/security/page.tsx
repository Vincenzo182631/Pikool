"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Monitor } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { api, ApiClientError } from "@/lib/api-client";
import { changePasswordSchema } from "@/lib/validation/settings";

interface SessionRow {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  current: boolean;
}

export default function SecuritySettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.get<SessionRow[]>("/api/sessions"),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = changePasswordSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = String(i.path[0]);
        if (k && !next[k]) next[k] = i.message;
      }
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/settings/password", parsed.data);
      toast.success("Password changed");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(id: string) {
    try {
      await api.del(`/api/sessions/${id}`);
      await qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session revoked");
    } catch {
      toast.error("Couldn't revoke session.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4" noValidate>
            <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set("currentPassword")} error={errors.currentPassword} />
            <Field label="New password" name="newPassword" type="password" autoComplete="new-password" value={form.newPassword} onChange={set("newPassword")} error={errors.newPassword} hint="At least 10 characters, mixed case and a number." />
            <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
            <Button type="submit" loading={loading}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.isLoading ? (
            <div className="h-16 animate-pulse rounded-lg bg-secondary" />
          ) : (
            sessions.data?.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Monitor className="size-5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {shortenUa(s.userAgent)}{" "}
                      {s.current && <Badge variant="accent" className="ml-1">This device</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.ip ?? "unknown IP"} · started {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {!s.current && (
                  <Button size="sm" variant="outline" onClick={() => revoke(s.id)}>
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function shortenUa(ua: string | null) {
  if (!ua) return "Unknown device";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return ua.slice(0, 32);
}
