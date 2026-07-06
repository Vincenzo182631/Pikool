"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { api, ApiClientError } from "@/lib/api-client";
import { adminUpdateCourtSchema, COURT_SURFACES, COURT_ENVIRONMENTS } from "@/lib/validation/court";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full rounded-2xl border border-border/60 bg-secondary/60 clay-inset px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const AMENITY_OPTIONS = ["Parking", "Restrooms", "Water", "Nets provided", "Seating", "Pro shop", "Coffee"];

export interface CourtEditData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
  phone: string | null;
  website: string | null;
  surface: string;
  environment: string;
  hasLighting: boolean;
  amenities: string[];
  verified: boolean;
}

export function CourtEditForm({ court }: { court: CourtEditData }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [amenities, setAmenities] = React.useState<string[]>(court.amenities);
  const [form, setForm] = React.useState({
    name: court.name,
    address: court.address ?? "",
    city: court.city ?? "",
    country: court.country ?? "",
    lat: String(court.lat),
    lng: String(court.lng),
    phone: court.phone ?? "",
    website: court.website ?? "",
    surface: court.surface,
    environment: court.environment,
    hasLighting: court.hasLighting,
    verified: court.verified,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setErrors({ lat: "Latitude and longitude must be numbers." });
      return;
    }

    const parsed = adminUpdateCourtSchema.safeParse({
      name: form.name,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      lat,
      lng,
      phone: form.phone || null,
      website: form.website || null,
      surface: form.surface,
      environment: form.environment,
      hasLighting: form.hasLighting,
      amenities,
      verified: form.verified,
    });
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
      await api.patch(`/api/admin/courts/${court.id}`, parsed.data);
      toast.success("Court updated");
      router.push("/admin/courts");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't save changes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Court name" name="name" value={form.name} onChange={set("name")} error={errors.name} />

      <Field label="Address" name="address" value={form.address} onChange={set("address")} error={errors.address} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" value={form.city} onChange={set("city")} error={errors.city} />
        <Field label="Country" name="country" value={form.country} onChange={set("country")} error={errors.country} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Latitude" name="lat" value={form.lat} onChange={set("lat")} error={errors.lat} inputMode="decimal" />
        <Field label="Longitude" name="lng" value={form.lng} onChange={set("lng")} error={errors.lng} inputMode="decimal" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <Field label="Website" name="website" value={form.website} onChange={set("website")} error={errors.website} placeholder="https://…" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="surface">Surface</Label>
          <select id="surface" className={selectClass} value={form.surface} onChange={set("surface")}>
            {COURT_SURFACES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="environment">Type</Label>
          <select id="environment" className={selectClass} value={form.environment} onChange={set("environment")}>
            {COURT_ENVIRONMENTS.map((en) => (
              <option key={en} value={en}>
                {en.charAt(0) + en.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          checked={form.hasLighting}
          onChange={(e) => setForm((f) => ({ ...f, hasLighting: e.target.checked }))}
        />
        Has lighting for night play
      </label>

      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const active = amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAmenities((prev) => (active ? prev.filter((x) => x !== a) : [...prev, a]))}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          checked={form.verified}
          onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))}
        />
        <span className="font-medium">Verified court</span>
      </label>

      <div className="flex gap-2">
        <Button type="submit" loading={loading}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/courts")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
