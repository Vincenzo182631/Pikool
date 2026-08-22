"use client";

import * as React from "react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { IntroSlides } from "@/components/onboarding/intro-slides";
import { useMe } from "@/hooks/use-auth";

const INTRO_SEEN_KEY = "pp.introSeen";

export default function OnboardingPage() {
  const { data: me, isLoading } = useMe();
  const [showIntro, setShowIntro] = React.useState<boolean | null>(null);

  // Resolve on the client so the intro isn't re-shown to returning users.
  React.useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch {
      /* private mode — just show the intro */
    }
    setShowIntro(!seen);
  }, []);

  function finishIntro() {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      /* non-fatal */
    }
    setShowIntro(false);
  }

  if (showIntro === null || isLoading) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <div className="h-[560px] animate-pulse rounded-[28px] bg-card/70" />
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="mx-auto max-w-xl py-4">
        <IntroSlides onFinish={finishIntro} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col justify-center py-8">
      <OnboardingWizard me={me ?? null} />
    </div>
  );
}
