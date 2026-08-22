"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/upload/image-upload";
import { api, ApiClientError } from "@/lib/api-client";
import {
  onboardingSchema,
  updateProfileSchema,
  PLAY_FORMATS,
  DOMINANT_HANDS,
  SKILL_LEVELS,
  AVAILABILITY_OPTIONS,
} from "@/lib/validation/user";
import { SKILL_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Me } from "@/types/user";

const selectClass =
  "flex h-10 w-full rounded-2xl border border-border/60 bg-secondary/60 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Mode = "onboarding" | "edit";

interface ProfileFormProps {
  mode: Mode;
  me: Me | null;
}

/** Shared profile editor used by onboarding and the edit-profile page. */
export function ProfileForm({ mode, me }: ProfileFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const p = me?.profile ?? null;

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(p?.avatarUrl ?? null);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(p?.coverUrl ?? null);
  const [formats, setFormats] = React.useState<string[]>(p?.formats ?? ["DOUBLES"]);
  const [availability, setAvailability] = React.useState<string[]>(p?.availability ?? []);
  const [form, setForm] = React.useState({
    firstName: me?.firstName ?? "",
    lastName: me?.lastName ?? "",
    username: p?.username ?? "",
    displayName: p?.displayName ?? "",
    city: p?.city ?? "",
    country: p?.country ?? "",
    skillLevel: p?.skillLevel ?? "L2_5",
    dominantHand: p?.dominantHand ?? "RIGHT",
    playingStyle: p?.playingStyle ?? "",
    yearsPlaying: String(p?.yearsPlaying ?? 0),
    favoritePaddle: p?.favoritePaddle ?? "",
    bio: p?.bio ?? "",
  });

  function set(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }
  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = {
      username: form.username,
      displayName: form.displayName || undefined,
      avatarUrl: avatarUrl || undefined,
      coverUrl: coverUrl || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      skillLevel: form.skillLevel,
      dominantHand: form.dominantHand,
      playingStyle: form.playingStyle || undefined,
      yearsPlaying: Number(form.yearsPlaying),
      favoritePaddle: form.favoritePaddle || undefined,
      formats,
      availability,
      bio: form.bio || undefined,
      ...(mode === "edit"
        ? { firstName: form.firstName || undefined, lastName: form.lastName || undefined }
        : {}),
    };

    const schema = mode === "edit" ? updateProfileSchema : onboardingSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/api/users/me", parsed.data);
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(mode === "onboarding" ? "Profile complete — welcome aboard!" : "Profile saved");
      router.push(mode === "onboarding" ? "/dashboard" : `/players/${form.username}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setErrors({ username: err.message });
      }
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Photos */}
      <div>
        <Label>Cover photo</Label>
        <div className="mt-1.5">
          <ImageUpload variant="cover" value={coverUrl} onChange={setCoverUrl} label="Upload cover photo" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ImageUpload value={avatarUrl} onChange={setAvatarUrl} label="Upload profile photo" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Profile photo</p>
          <p>Square image works best. JPG or PNG.</p>
        </div>
      </div>

      {mode === "edit" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" name="firstName" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
          <Field label="Last name" name="lastName" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Username" name="username" value={form.username} onChange={set("username")} error={errors.username} hint="Letters, numbers and underscores." />
        <Field label="Display name" name="displayName" placeholder="How your name shows publicly" value={form.displayName} onChange={set("displayName")} error={errors.displayName} />
      </div>

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
          {PLAY_FORMATS.map((f) => (
            <Chip key={f} active={formats.includes(f)} onClick={() => toggle(formats, setFormats, f)}>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </Chip>
          ))}
        </div>
        {errors.formats && <p className="text-xs font-medium text-destructive">{errors.formats}</p>}
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={availability.includes(o.value)}
              onClick={() => toggle(availability, setAvailability, o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea id="bio" maxLength={280} placeholder="Tell the community about your game…" value={form.bio} onChange={set("bio")} />
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        {mode === "onboarding" ? "Finish setup" : "Save changes"}
      </Button>
    </form>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold press",
        active
          ? "bg-primary text-primary-foreground shadow-subtle"
          : "bg-secondary/60 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
