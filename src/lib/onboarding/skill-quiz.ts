import { SKILL_LEVELS } from "@/lib/validation/user";

export type SkillLevel = (typeof SKILL_LEVELS)[number];

/**
 * A single option the player can pick. `score` feeds the rating model; some
 * options (on the experience question) also imply a `years` value so we can
 * pre-fill the profile without a separate question.
 */
export interface QuizOption {
  value: string;
  label: string;
  hint?: string;
  score: number;
  years?: number;
}

/**
 * `base`     — anchors the rating (experience). Exactly one base question.
 * `modifier` — added on top (athletic background).
 * `signal`   — averaged together (on-court skills). Keeps any single skill
 *              question from dominating the estimate.
 */
export interface QuizQuestion {
  id: string;
  role: "base" | "modifier" | "signal";
  title: string;
  subtitle: string;
  options: QuizOption[];
}

export const SKILL_QUIZ: QuizQuestion[] = [
  {
    id: "experience",
    role: "base",
    title: "How long have you been playing pickleball?",
    subtitle: "This anchors your starting rating — be honest, it adjusts as you play.",
    options: [
      { value: "brand_new", label: "I'm brand new", hint: "Never really played a game", score: 2.0, years: 0 },
      { value: "casual_start", label: "Just getting started", hint: "A handful of casual sessions", score: 2.3, years: 0 },
      { value: "regular_6_24", label: "6 months – 2 years", hint: "I play fairly regularly", score: 2.8, years: 1 },
      { value: "committed_2_5", label: "2 – 5 years", hint: "It's part of my routine", score: 3.4, years: 3 },
      { value: "veteran_5p", label: "5+ years", hint: "I've been around the courts", score: 3.9, years: 6 },
    ],
  },
  {
    id: "background",
    role: "modifier",
    title: "Any racket or paddle sport background?",
    subtitle: "Tennis, badminton, squash or table tennis transfers fast to pickleball.",
    options: [
      { value: "racket_competitive", label: "Yes — competitively", hint: "Leagues, teams or tournaments", score: 0.5 },
      { value: "racket_casual", label: "Yes — casually", hint: "Played for fun over the years", score: 0.3 },
      { value: "athletic_other", label: "Other sports", hint: "Generally athletic, no racket sports", score: 0.15 },
      { value: "new_to_sport", label: "New to racket sports", hint: "This is my first", score: 0.0 },
    ],
  },
  {
    id: "serve_return",
    role: "signal",
    title: "How are your serves and returns?",
    subtitle: "Consistency off both is one of the clearest skill markers.",
    options: [
      { value: "learning_in", label: "Still landing them", hint: "Working on getting them in", score: -0.3 },
      { value: "mostly_in", label: "Mostly reliable", hint: "I land most of them", score: 0.0 },
      { value: "deep_control", label: "Deep & controlled", hint: "I place them with pace", score: 0.3 },
      { value: "spin_placement", label: "Spin on demand", hint: "Placement and spin at will", score: 0.6 },
    ],
  },
  {
    id: "third_shot",
    role: "signal",
    title: "The “third shot drop” is…",
    subtitle: "The soft shot that lets you get to the net. A telltale of the 3.0+ game.",
    options: [
      { value: "new", label: "New to me", hint: "Haven't learned it yet", score: -0.3 },
      { value: "learning", label: "I know it", hint: "Still developing it", score: 0.0 },
      { value: "sometimes", label: "I use it in games", hint: "Comfortable most rallies", score: 0.3 },
      { value: "weapon", label: "It's a weapon", hint: "Drop or drive by choice", score: 0.6 },
    ],
  },
  {
    id: "kitchen",
    role: "signal",
    title: "At the kitchen line (non-volley zone), I…",
    subtitle: "The soft game — dinking and resets — separates bangers from all-court players.",
    options: [
      { value: "bang", label: "Prefer to drive", hint: "I'd rather speed it up", score: -0.2 },
      { value: "short_rallies", label: "Dink a little", hint: "A few, then I go for it", score: 0.0 },
      { value: "sustain_reset", label: "Sustain & reset", hint: "I can hold long rallies", score: 0.3 },
      { value: "strategic", label: "Dink strategically", hint: "I use it to force errors", score: 0.6 },
    ],
  },
  {
    id: "competition",
    role: "signal",
    title: "Have you played competitively?",
    subtitle: "Match reps under pressure count for a lot.",
    options: [
      { value: "social", label: "Just social play", hint: "Open play and friendly games", score: 0.0 },
      { value: "ladders", label: "Local ladders", hint: "Rec leagues and ladders", score: 0.25 },
      { value: "club_league", label: "Club / league", hint: "Organized competition", score: 0.45 },
      { value: "tournaments", label: "Tournaments", hint: "Sanctioned events (DUPR/UTPR)", score: 0.7 },
    ],
  },
];

/** Skill band boundaries — an estimated rating snaps to the nearest DUPR band. */
const LEVEL_THRESHOLDS: { max: number; level: SkillLevel }[] = [
  { max: 2.25, level: "L2_0" },
  { max: 2.75, level: "L2_5" },
  { max: 3.25, level: "L3_0" },
  { max: 3.75, level: "L3_5" },
  { max: 4.25, level: "L4_0" },
  { max: 4.75, level: "L4_5" },
  { max: 5.25, level: "L5_0" },
  { max: Infinity, level: "L5_5" },
];

export function ratingToLevel(rating: number): SkillLevel {
  return LEVEL_THRESHOLDS.find((t) => rating < t.max)!.level;
}

export interface Assessment {
  rating: number;
  level: SkillLevel;
  years: number;
}

/**
 * Turn a map of {questionId: optionValue} into an estimated rating and level.
 * rating = base + Σ modifiers + mean(signals), clamped to the DUPR range.
 */
export function computeAssessment(answers: Record<string, string>): Assessment {
  let base = 2.0;
  let years = 0;
  let modifierSum = 0;
  const signals: number[] = [];

  for (const q of SKILL_QUIZ) {
    const picked = q.options.find((o) => o.value === answers[q.id]);
    if (!picked) continue;
    if (q.role === "base") {
      base = picked.score;
      years = picked.years ?? 0;
    } else if (q.role === "modifier") {
      modifierSum += picked.score;
    } else {
      signals.push(picked.score);
    }
  }

  const signalAvg = signals.length ? signals.reduce((a, b) => a + b, 0) / signals.length : 0;
  const raw = base + modifierSum + signalAvg;
  const rating = Math.round(Math.max(2.0, Math.min(5.5, raw)) * 10) / 10;

  return { rating, level: ratingToLevel(rating), years };
}

/** True once every quiz question has an answer. */
export function isQuizComplete(answers: Record<string, string>): boolean {
  return SKILL_QUIZ.every((q) => Boolean(answers[q.id]));
}
