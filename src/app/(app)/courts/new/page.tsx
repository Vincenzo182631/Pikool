"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { api, ApiClientError } from "@/lib/api-client";
import { createCourtSchema, COURT_SURFACES, COURT_ENVIRONMENTS } from "@/lib/validation/court";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full rounded-2xl border border-border/60 bg-secondary/60 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const AMENITY_OPTIONS = ["Parking", "Restrooms", "Water", "Nets provided", "Seating", "Pro shop", "Coffee"];

export default function NewCourtPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [form, setForm] = React.useState({
    name: "",
    city: "",
    country: "",
    surface: "ACRYLIC",
    environment: "OUTDOOR",
    hasLighting: false,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function locate() {
    if (!navigator.geolocation) return toast.error("Geolocation isn't available.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get your location.");
      },
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!coords) {
      toast.error("Set the court's location first.");
      return;
    }
    const parsed = createCourtSchema.safeParse({
      name: form.name,
      city: form.city || undefined,
      country: form.country || undefined,
      surface: form.surface,
      environment: form.environment,
      hasLighting: form.hasLighting,
      amenities,
      lat: coords.lat,
      lng: coords.lng,
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
      const court = await api.post<{ id: string }>("/api/courts", parsed.data);
      toast.success("Court added! Thanks for contributing.");
      router.push(`/courts/${court.id}`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't add court.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add a court" description="Put a pickleball court on the map for the community." />
      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Add a court</CardTitle>
          <CardDescription>Court details</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="Court name" name="name" value={form.name} onChange={set("name")} error={errors.name} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" value={form.city} onChange={set("city")} />
              <Field label="Country" name="country" value={form.country} onChange={set("country")} />
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={locate} loading={locating}>
                  <LocateFixed /> Use my location
                </Button>
                {coords ? (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-primary" />
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
              </div>
              {errors.lat && <p className="text-xs font-medium text-destructive">{errors.lat}</p>}
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
                      onClick={() =>
                        setAmenities((prev) => (active ? prev.filter((x) => x !== a) : [...prev, a]))
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-semibold press",
                        active
                          ? "bg-primary text-primary-foreground shadow-subtle"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" loading={loading}>
                Add court
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
