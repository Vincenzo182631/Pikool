"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useMe } from "@/hooks/use-auth";
import { api, ApiClientError } from "@/lib/api-client";
import { changeEmailSchema } from "@/lib/validation/settings";

export default function AccountSettingsPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [newEmail, setNewEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ newEmail?: string; password?: string }>({});
  const [loading, setLoading] = React.useState(false);

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = changeEmailSchema.safeParse({ newEmail, password });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof typeof errors;
        if (k && !next[k]) next[k] = i.message;
      }
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/settings/email", parsed.data);
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Email updated");
      setNewEmail("");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Name" value={`${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "—"} />
          <Row label="Username" value={me?.profile ? `@${me.profile.username}` : "Not set"} />
          <Row label="Email" value={me?.email ?? "—"} />
          <Row label="Roles" value={me?.roles.join(", ") ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changeEmail} className="space-y-4" noValidate>
            <Field
              label="New email"
              name="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              error={errors.newEmail}
            />
            <Field
              label="Confirm with password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Button type="submit" loading={loading}>
              Update email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
