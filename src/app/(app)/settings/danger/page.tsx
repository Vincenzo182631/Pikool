"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Download, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ApiClientError, apiFetch } from "@/lib/api-client";

export default function DangerZonePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [confirming, setConfirming] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function exportData() {
    // Direct navigation triggers the file download (Content-Disposition).
    window.location.href = "/api/account/export";
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/account", {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });
      qc.clear();
      toast.success("Your account has been deleted.");
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't delete account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export your data</CardTitle>
          <CardDescription>Download a JSON copy of your account, profile, and activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={exportData}>
            <Download /> Export data
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-5" /> Delete account
          </CardTitle>
          <CardDescription>
            This permanently disables your account. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!confirming ? (
            <Button variant="destructive" onClick={() => setConfirming(true)}>
              Delete my account
            </Button>
          ) : (
            <form onSubmit={deleteAccount} className="space-y-4">
              <Field
                label="Confirm with your password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" variant="destructive" loading={loading}>
                  Permanently delete
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
