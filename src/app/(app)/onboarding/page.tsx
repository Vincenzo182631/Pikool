"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { api, ApiClientError } from "@/lib/api-client";
import { onboardingSchema, PLAY_FORMATS, DOMINANT_HANDS, SKILL_LEVELS } from "@/lib/validation/user";
import { SKILL_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
    city: "",
    country: "",
    skillLevel: "L2_5",
    dominantHand: "RIGHT",
    playingStyle: "",
    yearsPlaying: "0",
    favoritePaddle: "",
  });
  const [formats, setFormats] = React.useState<string[]>(["DOUBLES"]);

  function set(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function toggleFormat(f: string) {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = onboardingSchema.safeParse({
      ...form,
      city: form.city || undefined,
      country: form.country || undefined,
      playingStyle: form.playingStyle || undefined,
      favoritePaddle: form.favoritePaddle || undefined,
      yearsPlaying: Number(form.yearsPlaying),
      formats,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setLoading(true);
    try {
      await api.patch("/api/users/me", parsed.data);
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile complete — welcome aboard!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set up your profile</CardTitle>
          <CardDescription>
            This powers matchmaking and your player card. You can edit it anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" name="firstName" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
              <Field label="Last name" name="lastName" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            </div>
            <Field label="Username" name="username" value={form.username} onChange={set("username")} error={errors.username} hint="Letters, numbers and underscores." />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" value={form.city} onChange={set("city")} error={errors.city} />
              <Field label="Country" name="country" value={form.country} onChange={set("country")} error={errors.country} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="skillLevel">Skill level</Label>
                <select id="skillLevel" className={selectClass} value={form.skillLevel} onChange={set("skillLevel")}>
                  {SKILL_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {SKILL_META[l]?.value} · {SKILL_META[l]?.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dominantHand">Dominant hand</Label>
                <select id="dominantHand" className={selectClass} value={form.dominantHand} onChange={set("dominantHand")}>
                  {DOMINANT_HANDS.map((h) => (
                    <option key={h} value={h}>
                      {h.charAt(0) + h.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Years playing" name="yearsPlaying" type="number" min={0} max={80} value={form.yearsPlaying} onChange={set("yearsPlaying")} error={errors.yearsPlaying} />
              <Field label="Playing style" name="playingStyle" placeholder="e.g. Aggressive baseliner" value={form.playingStyle} onChange={set("playingStyle")} />
            </div>
            <Field label="Favorite paddle" name="favoritePaddle" placeholder="e.g. Selkirk Vanguard" value={form.favoritePaddle} onChange={set("favoritePaddle")} />

            <div className="space-y-2">
              <Label>Preferred formats</Label>
              <div className="flex flex-wrap gap-2">
                {PLAY_FORMATS.map((f) => {
                  const active = formats.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFormat(f)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
              {errors.formats && <p className="text-xs font-medium text-destructive">{errors.formats}</p>}
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Finish setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
