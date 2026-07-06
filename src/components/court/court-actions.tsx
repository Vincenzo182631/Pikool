"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, LogIn, LogOut, Navigation } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Check-in / check-out toggle with live occupancy feedback. */
export function CheckInButton({
  courtId,
  initialCheckedIn,
}: {
  courtId: string;
  initialCheckedIn: boolean;
}) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = React.useState(initialCheckedIn);
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (checkedIn) {
        await api.del(`/api/courts/${courtId}/checkin`);
        setCheckedIn(false);
        toast.success("Checked out");
      } else {
        await api.post(`/api/courts/${courtId}/checkin`);
        setCheckedIn(true);
        toast.success("Checked in — have a great game!");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={toggle} loading={loading} variant={checkedIn ? "secondary" : "default"}>
      {checkedIn ? <LogOut /> : <LogIn />}
      {checkedIn ? "Check out" : "Check in"}
    </Button>
  );
}

/** Save / unsave a court. */
export function SaveCourtButton({
  courtId,
  initialSaved,
}: {
  courtId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = React.useState(initialSaved);
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await api.post<{ saved: boolean }>(`/api/courts/${courtId}/save`);
      setSaved(res.saved);
    } catch {
      toast.error("Couldn't update saved courts.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={toggle} loading={loading} aria-pressed={saved}>
      <Bookmark className={cn(saved && "fill-primary text-primary")} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

/** Deep-link to native maps directions. */
export function DirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return (
    <Button asChild variant="outline">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Navigation /> Directions
      </a>
    </Button>
  );
}
