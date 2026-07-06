"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ImageUpload } from "@/components/upload/image-upload";
import { api, ApiClientError } from "@/lib/api-client";
import { PLAY_FORMATS, DOMINANT_HANDS, SKILL_LEVELS, AVAILABILITY_OPTIONS } from "@/lib/validation/user";
import { SKILL_META } from "@/lib/constants";
import { SKILL_QUIZ, computeAssessment } from "@/lib/onboarding/skill-quiz";
import { cn } from "@/lib/utils";
import type { Me } from "@/types/user";

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const FORMAT_LABELS: Record<string, string> = { SINGLES: "Singles", DOUBLES: "Doubles", MIXED: "Mixed" };
const HAND_LABELS: Record<string, string> = { LEFT: "Left", RIGHT: "Right", AMBIDEXTROUS: "Both" };

type StepId = "welcome" | "identity" | `quiz:${string}` | "result" | "preferences";

export function OnboardingWizard({ me }: { me: Me | null }) {
  const router = useRouter();
  const qc = useQueryClient();

  const [[step, dir], setStep] = React.useState<[number, number]>([0, 1]);
  const [loading, setLoading] = React.useState(false);

  const [identity, setIdentity] = React.useState({
    username: "",
    displayName: [me?.firstName, me?.lastName].filter(Boolean).join(" "),
    city: "",
    country: "",
  });
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [levelOverride, setLevelOverride] = React.useState<number | null>(null);
  const [dominantHand, setDominantHand] = React.useState("RIGHT");
  const [formats, setFormats] = React.useState<string[]>(["DOUBLES"]);
  const [availability, setAvailability] = React.useState<string[]>([]);
  const [favoritePaddle, setFavoritePaddle] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [usernameError, setUsernameError] = React.useState<string | null>(null);

  // Step list is static in shape: welcome, identity, one per quiz question, result, preferences.
  const steps: StepId[] = React.useMemo(
    () => ["welcome", "identity", ...SKILL_QUIZ.map((q) => `quiz:${q.id}` as StepId), "result", "preferences"],
    [],
  );
  const total = steps.length;
  const current: StepId = steps[step] ?? "welcome";

  const assessment = React.useMemo(() => computeAssessment(answers), [answers]);
  const suggestedIndex = SKILL_LEVELS.indexOf(assessment.level);
  const effectiveIndex = Math.max(0, Math.min(SKILL_LEVELS.length - 1, levelOverride ?? suggestedIndex));
  const effectiveLevel = SKILL_LEVELS[effectiveIndex] ?? "L2_5";

  const usernameValid = identity.username.length >= 3 && USERNAME_RE.test(identity.username);

  function canAdvance(): boolean {
    if (current === "identity") return usernameValid;
    if (current.startsWith("quiz:")) {
      const qid = current.slice(5);
      return Boolean(answers[qid]);
    }
    if (current === "preferences") return formats.length >= 1;
    return true;
  }

  const go = (delta: number) => setStep(([s]) => [Math.max(0, Math.min(total - 1, s + delta)), delta]);
  const next = () => go(1);
  const back = () => go(-1);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function selectAnswer(qid: string, value: string) {
    setAnswers((a) => ({ ...a, [qid]: value }));
    // Auto-advance for a fluid, quiz-like feel — but let them go back to change it.
    window.setTimeout(() => setStep(([s]) => [Math.min(total - 1, s + 1), 1]), 240);
  }

  async function finish() {
    if (!usernameValid) {
      setUsernameError("Enter a valid username (3+ letters, numbers or underscores).");
      setStep([1, -1]);
      return;
    }
    setLoading(true);
    try {
      await api.patch("/api/users/me", {
        username: identity.username,
        displayName: identity.displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        city: identity.city || undefined,
        country: identity.country || undefined,
        skillLevel: effectiveLevel,
        dominantHand,
        yearsPlaying: assessment.years,
        formats,
        availability,
        favoritePaddle: favoritePaddle || undefined,
        bio: bio || undefined,
      });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("You're all set — welcome to the community!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setUsernameError(err.message);
        setStep([1, -1]);
        toast.error("That username is taken — pick another.");
      } else {
        toast.error(err instanceof ApiClientError ? err.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isLast = current === "preferences";

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Progress header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Step {step + 1} of {total}
          </span>
          <span>{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / total) * 100} />
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-card clay p-6 shadow-sm sm:p-8">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current}
            custom={dir}
            initial={{ opacity: 0, x: dir > 0 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? -32 : 32 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {current === "welcome" && <WelcomeStep />}

            {current === "identity" && (
              <IdentityStep
                identity={identity}
                setIdentity={setIdentity}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                usernameError={usernameError}
                setUsernameError={setUsernameError}
              />
            )}

            {current.startsWith("quiz:") &&
              (() => {
                const q = SKILL_QUIZ.find((x) => `quiz:${x.id}` === current)!;
                return (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      Skill check · {SKILL_QUIZ.indexOf(q) + 1}/{SKILL_QUIZ.length}
                    </p>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{q.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{q.subtitle}</p>
                    <div className="mt-5 space-y-2.5">
                      {q.options.map((o) => {
                        const active = answers[q.id] === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => selectAnswer(q.id, o.value)}
                            aria-pressed={active}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all",
                              active
                                ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                                : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50",
                            )}
                          >
                            <span>
                              <span className="block font-semibold">{o.label}</span>
                              {o.hint && <span className="mt-0.5 block text-sm text-muted-foreground">{o.hint}</span>}
                            </span>
                            <span
                              className={cn(
                                "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
                                active ? "bg-primary text-primary-foreground clay-sm" : "border-border",
                              )}
                            >
                              {active && <Check className="size-4" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            {current === "result" && (
              <ResultStep
                level={effectiveLevel}
                isSuggested={effectiveIndex === suggestedIndex}
                onNudge={(d) => {
                  const nextIdx = Math.max(0, Math.min(SKILL_LEVELS.length - 1, effectiveIndex + d));
                  setLevelOverride(nextIdx);
                }}
                onReset={() => setLevelOverride(null)}
              />
            )}

            {current === "preferences" && (
              <PreferencesStep
                dominantHand={dominantHand}
                setDominantHand={setDominantHand}
                formats={formats}
                toggleFormat={(v) => toggle(formats, setFormats, v)}
                availability={availability}
                toggleAvailability={(v) => toggle(availability, setAvailability, v)}
                favoritePaddle={favoritePaddle}
                setFavoritePaddle={setFavoritePaddle}
                bio={bio}
                setBio={setBio}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={step === 0 || loading} className={cn(step === 0 && "invisible")}>
          <ArrowLeft /> Back
        </Button>

        {isLast ? (
          <Button onClick={finish} loading={loading} disabled={!canAdvance()} size="lg">
            <Sparkles /> Finish setup
          </Button>
        ) : (
          <Button onClick={next} disabled={!canAdvance()} size="lg">
            {current === "welcome" ? "Let's go" : "Continue"} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ steps */

function WelcomeStep() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Trophy className="size-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Let&apos;s find your level</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        A few quick, relatable questions about your game — no jargon. We&apos;ll estimate your skill rating so
        matchmaking pairs you with the right players. It takes about a minute, and you can fine-tune everything
        afterwards.
      </p>
      <div className="mt-6 grid gap-2 text-left text-sm sm:grid-cols-3">
        {[
          "Answer 6 game questions",
          "Get your starting rating",
          "Fine-tune & you're in",
        ].map((t, i) => (
          <div key={t} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentityStep({
  identity,
  setIdentity,
  avatarUrl,
  setAvatarUrl,
  usernameError,
  setUsernameError,
}: {
  identity: { username: string; displayName: string; city: string; country: string };
  setIdentity: React.Dispatch<React.SetStateAction<{ username: string; displayName: string; city: string; country: string }>>;
  avatarUrl: string | null;
  setAvatarUrl: (v: string | null) => void;
  usernameError: string | null;
  setUsernameError: (v: string | null) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">First, the basics</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">How you&apos;ll show up to the community.</p>

      <div className="mt-5 flex justify-center">
        <ImageUpload value={avatarUrl} onChange={setAvatarUrl} label="Add a profile photo" />
      </div>

      <div className="mt-5 space-y-4">
        <Field
          label="Username"
          name="username"
          value={identity.username}
          onChange={(e) => {
            setUsernameError(null);
            setIdentity((s) => ({ ...s, username: e.target.value }));
          }}
          error={usernameError ?? undefined}
          hint="Letters, numbers and underscores. This is your @handle."
          placeholder="e.g. dink_master"
        />
        <Field
          label="Display name"
          name="displayName"
          value={identity.displayName}
          onChange={(e) => setIdentity((s) => ({ ...s, displayName: e.target.value }))}
          placeholder="How your name shows publicly"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="City"
            name="city"
            value={identity.city}
            onChange={(e) => setIdentity((s) => ({ ...s, city: e.target.value }))}
          />
          <Field
            label="Country"
            name="country"
            value={identity.country}
            onChange={(e) => setIdentity((s) => ({ ...s, country: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}

function ResultStep({
  level,
  isSuggested,
  onNudge,
  onReset,
}: {
  level: string;
  isSuggested: boolean;
  onNudge: (d: number) => void;
  onReset: () => void;
}) {
  const meta = SKILL_META[level] ?? SKILL_META.L2_5!;
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Your estimated level</p>
      <motion.div
        key={level}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto mt-4 flex w-full max-w-xs items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-5"
      >
        <button
          type="button"
          onClick={() => onNudge(-1)}
          aria-label="Lower level"
          className="grid size-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ChevronDown className="size-5" />
        </button>
        <div>
          <div className="text-4xl font-black tracking-tight text-primary">{meta.value}</div>
          <div className="mt-1 text-sm font-semibold">{meta.label}</div>
          <div className="text-xs text-muted-foreground">{meta.blurb}</div>
        </div>
        <button
          type="button"
          onClick={() => onNudge(1)}
          aria-label="Raise level"
          className="grid size-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ChevronUp className="size-5" />
        </button>
      </motion.div>

      <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
        {isSuggested
          ? "This is our estimate from your answers. Know your rating better? Nudge it up or down."
          : "Adjusted from our estimate."}{" "}
        Your rating refines automatically as you record games.
      </p>

      {!isSuggested && (
        <button type="button" onClick={onReset} className="mt-2 text-sm font-medium text-primary hover:underline">
          Reset to suggested
        </button>
      )}
    </div>
  );
}

function PreferencesStep({
  dominantHand,
  setDominantHand,
  formats,
  toggleFormat,
  availability,
  toggleAvailability,
  favoritePaddle,
  setFavoritePaddle,
  bio,
  setBio,
}: {
  dominantHand: string;
  setDominantHand: (v: string) => void;
  formats: string[];
  toggleFormat: (v: string) => void;
  availability: string[];
  toggleAvailability: (v: string) => void;
  favoritePaddle: string;
  setFavoritePaddle: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">How you like to play</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">This tunes who and what we match you with.</p>

      <div className="mt-5 space-y-5">
        <div>
          <Label className="mb-2 block">Dominant hand</Label>
          <div className="flex flex-wrap gap-2">
            {DOMINANT_HANDS.map((h) => (
              <Chip key={h} active={dominantHand === h} onClick={() => setDominantHand(h)}>
                {HAND_LABELS[h]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Preferred formats</Label>
          <div className="flex flex-wrap gap-2">
            {PLAY_FORMATS.map((f) => (
              <Chip key={f} active={formats.includes(f)} onClick={() => toggleFormat(f)}>
                {FORMAT_LABELS[f]}
              </Chip>
            ))}
          </div>
          {formats.length === 0 && <p className="mt-1.5 text-xs font-medium text-destructive">Pick at least one.</p>}
        </div>

        <div>
          <Label className="mb-2 block">When are you usually free?</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map((o) => (
              <Chip key={o.value} active={availability.includes(o.value)} onClick={() => toggleAvailability(o.value)}>
                {o.label}
              </Chip>
            ))}
          </div>
        </div>

        <Field
          label="Favorite paddle (optional)"
          name="favoritePaddle"
          value={favoritePaddle}
          onChange={(e) => setFavoritePaddle(e.target.value)}
          placeholder="e.g. Selkirk Vanguard"
        />

        <div className="space-y-1.5">
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Tell players a bit about your game…"
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold clay-pressable",
        active
          ? "bg-primary text-primary-foreground clay-sm"
          : "bg-secondary/60 text-muted-foreground clay-inset hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
