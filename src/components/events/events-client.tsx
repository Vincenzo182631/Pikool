"use client";

import * as React from "react";
import Image from "next/image";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";

const TABS = ["Camps", "Events"] as const;

export interface CampItem {
  id: string;
  name: string;
  dates: string;
  location: string;
  price: string;
  level: string;
  img: string;
}

export interface EventItem {
  id: string;
  name: string;
  month: string;
  day: string;
  time: string;
  spots: string;
}

export function EventsClient({
  camps,
  events,
  initialTab = "Camps",
}: {
  camps: CampItem[];
  events: EventItem[];
  initialTab?: (typeof TABS)[number];
}) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]>(initialTab);

  return (
    <>
      <Segmented options={TABS} value={tab} onChange={setTab} size="md" className="mb-5" />

      {tab === "Camps" ? (
        <div className="space-y-3.5">
          {camps.map((c) => (
            <article
              key={c.id}
              className="press relative h-[200px] overflow-hidden rounded-[22px] shadow-soft"
            >
              <Image src={c.img} alt="" fill sizes="(max-width:768px) 100vw, 672px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/65" />
              <span className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-ink">
                {c.level}
              </span>
              <span className="absolute right-4 top-4 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-bold text-ink">
                {c.price}
              </span>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="text-[11px] opacity-90">
                  {c.dates} · {c.location}
                </p>
                <h3 className="font-display text-2xl font-extrabold leading-tight">{c.name}</h3>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3.5 rounded-[18px] bg-card px-[18px] py-4 shadow-card"
            >
              <div className="tile-neutral grid size-14 shrink-0 place-items-center rounded-[14px]">
                <span className="text-[9px] font-bold uppercase text-muted-foreground">{e.month}</span>
                <span className="font-display text-lg font-extrabold leading-none text-ink">{e.day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display truncate text-base font-bold text-ink">{e.name}</h3>
                <p className="text-[11.5px] text-muted-foreground">
                  {e.time} · {e.spots}
                </p>
              </div>
              <Button size="sm">Join</Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export { TABS as EVENT_TABS };
