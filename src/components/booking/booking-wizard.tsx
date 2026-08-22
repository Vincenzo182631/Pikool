"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SectionTitle } from "@/components/ui/editorial";
import { cn } from "@/lib/utils";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "15:00", "17:00"];
const SERVICE_FEE = 2;

/** Next 7 days starting today. */
function useDays() {
  return React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);
}

export function BookingWizard({
  courtId,
  courtName,
  price,
}: {
  courtId: string;
  courtName: string;
  price: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const days = useDays();

  // Honour ?slot= coming from the court detail slot picker.
  const initialSlot = searchParams.get("slot");
  const initialTimeIdx = initialSlot ? TIME_SLOTS.indexOf(initialSlot) : -1;

  const [step, setStep] = React.useState(0);
  const [dateIdx, setDateIdx] = React.useState(1);
  const [timeIdx, setTimeIdx] = React.useState(initialTimeIdx >= 0 ? initialTimeIdx : 1);
  const [players, setPlayers] = React.useState(2);

  const date = days[dateIdx]!;
  const time = TIME_SLOTS[timeIdx]!;
  const endTime = `${String(Number(time.slice(0, 2)) + 1).padStart(2, "0")}:00`;
  const total = price + SERVICE_FEE;

  function back() {
    if (step === 0) router.push(`/courts/${courtId}`);
    else setStep((s) => s - 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {step < 2 && (
        <header className="mb-4 flex items-start gap-3">
          <IconButton onClick={back} aria-label="Back">
            <ArrowLeft className="size-[18px]" strokeWidth={1.8} />
          </IconButton>
          <div>
            <p className="text-xs text-muted-foreground">Step {step + 1} of 2</p>
            <h1 className="font-display text-2xl font-extrabold text-ink">
              {step === 0 ? "Choose your slot" : "Confirm booking"}
            </h1>
          </div>
        </header>
      )}

      {step === 0 && (
        <>
          {/* Date rail */}
          <div className="no-scrollbar -mx-5 mb-6 flex gap-2.5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            {days.map((d, i) => {
              const active = i === dateIdx;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setDateIdx(i)}
                  aria-pressed={active}
                  className={cn(
                    "press flex h-[78px] w-[58px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl",
                    active ? "bg-ink text-white shadow-pill-dark" : "bg-card text-ink shadow-subtle",
                  )}
                >
                  <span className={cn("text-[10px] font-semibold", active ? "opacity-70" : "opacity-60")}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="font-display text-[22px] font-extrabold leading-none">
                    {d.getDate()}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-semibold uppercase",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {d.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          <SectionTitle>Time slot</SectionTitle>
          <div className="mb-6 grid grid-cols-3 gap-2.5">
            {TIME_SLOTS.map((t, i) => {
              const active = i === timeIdx;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeIdx(i)}
                  aria-pressed={active}
                  className={cn(
                    "press h-[52px] rounded-[14px] text-[15px] font-bold",
                    active ? "bg-primary text-ink shadow-cta" : "bg-card text-ink shadow-subtle",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Players */}
          <SectionTitle>Players</SectionTitle>
          <div className="mb-6 flex items-center justify-between gap-4 rounded-[18px] bg-card p-[14px_18px] px-[18px] py-3.5 shadow-card">
            <div>
              <p className="text-sm font-semibold text-ink">How many players?</p>
              <p className="text-[11px] text-muted-foreground">Singles (2) or doubles (4)</p>
            </div>
            <div className="flex items-center gap-3">
              <IconButton
                size={34}
                aria-label="Fewer players"
                disabled={players <= 2}
                onClick={() => setPlayers((p) => Math.max(2, p - 1))}
              >
                <Minus className="size-4" strokeWidth={2} />
              </IconButton>
              <span className="font-display w-5 text-center text-xl font-extrabold text-ink">
                {players}
              </span>
              <IconButton
                size={34}
                aria-label="More players"
                disabled={players >= 4}
                onClick={() => setPlayers((p) => Math.min(4, p + 1))}
              >
                <Plus className="size-4" strokeWidth={2} />
              </IconButton>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => setStep(1)}>
            Continue · ${price} <ArrowRight />
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="mb-4 rounded-[20px] bg-card p-[18px] shadow-card">
            <Row label="Court" value={courtName} />
            <Row
              label="Date"
              value={date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            />
            <Row label="Time" value={`${time} — ${endTime}`} />
            <Row label="Players" value={players === 2 ? "Singles (2)" : `Doubles (${players})`} />
            <hr className="my-3 border-border" />
            <Row label="Court fee" value={`$${price}`} />
            <Row label="Service" value={`$${SERVICE_FEE}`} />
            <hr className="my-3 border-border" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">Total</span>
              <span className="font-display text-xl font-extrabold text-ink">${total}</span>
            </div>
          </div>

          <button
            type="button"
            className="press mb-6 flex w-full items-center gap-3 rounded-[20px] bg-card px-[18px] py-3.5 text-left shadow-card"
          >
            <span className="grid size-9 place-items-center rounded-[10px] bg-ink text-sm font-bold text-primary">
              ••
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-semibold text-ink">Apple Pay</span>
              <span className="block text-[11px] text-muted-foreground">Default payment</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.8} />
          </button>

          <Button size="lg" className="w-full" onClick={() => setStep(2)}>
            <Check /> Confirm booking
          </Button>
        </>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center px-8 py-10 text-center">
          <span className="animate-pop-in mb-6 grid size-24 place-items-center rounded-full bg-primary shadow-[0_12px_30px_rgba(184,218,30,0.4)]">
            <Check className="size-11 text-ink" strokeWidth={2.5} />
          </span>
          <h1 className="font-display text-[32px] font-extrabold text-ink">You&apos;re booked!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {courtName} ·{" "}
            {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
            {time}
          </p>

          {/* Booking reference block. A real QR is generated once bookings persist. */}
          <div className="my-7 grid size-40 place-items-center rounded-[18px] bg-ink/[0.04] p-4">
            <div className="grid size-full grid-cols-8 gap-[2px]">
              {Array.from({ length: 64 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-[1px]",
                    // Deterministic pattern — no randomness so SSR/CSR agree.
                    (i * 7 + (i % 5) * 3) % 3 === 0 ? "bg-ink" : "bg-transparent",
                  )}
                />
              ))}
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/matchmaking">View My Matches</Link>
          </Button>
          <Link href="/dashboard" className="mt-4 text-[13px] font-medium text-muted-foreground hover:text-ink">
            Back to home
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="truncate text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}
