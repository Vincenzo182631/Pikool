"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { api, ApiClientError } from "@/lib/api-client";
import { verifyEmailSchema } from "@/lib/validation/auth";

export default function VerifyPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyForm />
    </React.Suspense>
  );
}

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const parsed = verifyEmailSchema.safeParse({ email, code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setLoading(true);
    try {
      const result = await api.post<{ onboarded: boolean }>(
        "/api/auth/verify-email",
        parsed.data,
      );
      toast.success("Email verified!");
      router.push(result.onboarded ? "/dashboard" : "/onboarding");
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Verification failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await api.post("/api/auth/resend-otp", { email });
      toast.success("A new code is on its way.");
    } catch {
      toast.error("Couldn't resend right now. Try again shortly.");
    } finally {
      setResending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email || "your email"}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field
            label="Verification code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            className="[&_input]:text-center [&_input]:text-lg [&_input]:tracking-[0.5em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            error={error}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Verify & continue
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
          <Link href="/login" className="text-muted-foreground hover:underline">
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
