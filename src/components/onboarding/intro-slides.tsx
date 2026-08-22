"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    eyebrow: "Let's Play",
    title: "Pickleball",
    body: "Find courts, track matches,\nand enjoy the game together today.",
    img: "/editorial/onboarding_hero.jpg",
  },
  {
    eyebrow: "Discover",
    title: "Nearby Courts",
    body: "Real-time availability at\ncourts all around you.",
    img: "/editorial/court_sunset.jpg",
  },
  {
    eyebrow: "Grow",
    title: "Your Game",
    body: "Track wins, ratings, and progress\nas you climb the ladder.",
    img: "/editorial/event_doubles.jpg",
  },
];

/**
 * Full-bleed first-run intro. Finishing hands off to the profile/skill wizard,
 * which is where the account actually gets set up.
 */
export function IntroSlides({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = React.useState(0);

  function next() {
    if (step === SLIDES.length - 1) onFinish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[28px] sm:min-h-[620px]">
      {SLIDES.map((s, i) => (
        <div
          key={s.title}
          aria-hidden={i !== step}
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-out",
            i === step ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0",
          )}
        >
          <Image
            src={s.img}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width:768px) 100vw, 640px"
            className="object-cover"
          />
          <div className="scrim-hero absolute inset-0" />
        </div>
      ))}

      {/* Copy */}
      <div className="absolute inset-x-6 bottom-[120px] text-white">
        <p className="text-2xl font-medium tracking-[-0.02em]">{SLIDES[step]!.eyebrow}</p>
        <h1 className="font-display text-[52px] font-bold leading-none tracking-[-0.03em]">
          {SLIDES[step]!.title}
        </h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/90">
          {SLIDES[step]!.body}
        </p>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-6 bottom-[46px] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "h-2 rounded-full transition-all duration-[250ms]",
                i === step ? "w-7 bg-white" : "w-2 bg-white/35",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFinish}
            className="text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={step === SLIDES.length - 1 ? "Get started" : "Next slide"}
            className="press press-icon grid size-[52px] place-items-center rounded-full bg-ink text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
          >
            <ArrowRight className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
