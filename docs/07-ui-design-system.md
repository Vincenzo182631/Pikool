# 07 — UI Design System

**Feel:** premium sports application, Apple-quality interface. Large cards,
beautiful spacing, smooth animations, rounded corners, glassmorphism where
appropriate, professional typography, and a green accent inspired by pickleball
courts. **Dark mode and light mode are both first-class.**

## Design principles

1. **Clarity over decoration** — content first, chrome second.
2. **Generous space** — let cards breathe; use an 8px spacing scale.
3. **One accent, used with intent** — court-green signals action and identity.
4. **Motion with meaning** — transitions guide attention, never distract.
5. **Consistent components** — everything is a reusable primitive.
6. **Accessible always** — AA contrast, focus rings, keyboard paths.

## Color tokens

Defined as CSS variables and consumed by Tailwind. Both themes are authored;
the accent stays vivid in both.

```css
:root {
  /* Brand — pickleball court green */
  --brand-50:  #ecfdf3;
  --brand-100: #d1fadf;
  --brand-300: #6ce9a6;
  --brand-500: #12b76a;  /* primary accent */
  --brand-600: #039855;  /* hover/pressed */
  --brand-700: #027a48;

  /* Light theme */
  --bg:            #f7f8fa;
  --surface:       #ffffff;
  --surface-2:     #f1f3f5;
  --border:        #e6e8eb;
  --text:          #0c111d;
  --text-muted:    #5b6472;
  --ring:          var(--brand-500);
}

:root[data-theme="dark"], .dark {
  --bg:            #0b0f14;
  --surface:       #111820;
  --surface-2:     #161f29;
  --border:        #23303d;
  --text:          #eef2f6;
  --text-muted:    #9aa7b4;
  --ring:          var(--brand-300);
}

/* Semantic */
--success: var(--brand-500);
--warning: #f79009;
--danger:  #f04438;
--info:    #2e90fa;
```

- **Contrast:** verify text on `--surface` and `--brand-500` meets **WCAG AA**
  (≥ 4.5:1 for body). Never place `--brand-500` text on white without checking.
- **Glassmorphism:** `background: color-mix(in srgb, var(--surface) 70%,
  transparent); backdrop-filter: blur(16px);` — reserve for overlays, nav bars,
  and floating map cards, not primary content.

## Typography

- **Font:** `Inter` (variable) for UI; optional `Satoshi`/`Clash` for large
  display headings. Load via `next/font` (self-hosted, no layout shift).
- **Scale (rem):** `xs .75 · sm .875 · base 1 · lg 1.125 · xl 1.25 · 2xl 1.5 ·
  3xl 1.875 · 4xl 2.25 · 5xl 3`.
- **Weights:** 400 body, 500 UI labels, 600 headings, 700 display.
- **Numerals:** tabular for stats/scores (`font-variant-numeric: tabular-nums`).

## Spacing, radius, elevation

- **Spacing scale (px):** 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Radius:** `sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · full 9999`. Cards use
  `lg`–`xl`; pills/avatars `full`.
- **Shadows (light):** subtle, layered — `0 1px 2px rgba(16,24,40,.06)` to
  `0 12px 24px rgba(16,24,40,.10)`. In dark mode prefer borders + faint glow over
  heavy shadows.

## Motion (Framer Motion)

- **Durations:** micro 120ms, standard 200ms, entrance 280ms.
- **Easing:** `[0.22, 1, 0.36, 1]` (ease-out-expo-ish) for entrances.
- Page/route transitions fade+lift 8px. Cards spring on hover (scale 1.01).
- Respect `prefers-reduced-motion` — disable non-essential motion.

## Component library

Built on **shadcn/ui** (Radix) + Tailwind. All live in `components/ui` and are
themed via tokens. Categories:

**Primitives:** Button, IconButton, Input, Textarea, Select, Combobox, Checkbox,
Radio, Switch, Slider, Tabs, Tooltip, Popover, Dialog/Modal, Sheet/Drawer,
Dropdown, Toast (sonner), Skeleton, Badge, Avatar, Progress, Separator.

**Composite / domain:**
- `PlayerCard` — the pro-style profile card (avatar, rating pill, stat row).
- `RatingBadge` — skill level chip (2.0–5.5) with color ramp.
- `StatTile` — labeled number (games, wins, streak) with tabular numerals.
- `CourtCard` / `CourtDetailPanel` — photos, busy level, amenities, check-ins.
- `BusyLevelMeter` — occupancy indicator (quiet → busy).
- `MapMarker` / `MarkerCluster` / `MapFilterBar` — see `10`.
- `PostCard` (variants per `PostType`) — feed items.
- `ChatBubble`, `ChatComposer`, `PresenceDot`, `TypingIndicator` — messaging.
- `EventCard`, `CalendarView`, `BracketView` — events/tournaments.
- `ListingCard`, `StoreCard`, `ProductCard` — commerce.
- `NotificationItem`, `EmptyState`, `PageHeader`, `FilterSheet`.

**Rules for components**
- Presentational only — no fetching. Data comes via props/hooks from `features/`.
- Every interactive element: visible focus ring, disabled + loading states,
  keyboard support.
- Compose, don't fork — variants via props, not copies.

## Layout & responsiveness

- **Breakpoints (Tailwind):** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- **App shell:** left rail nav (desktop) → bottom tab bar (mobile); top bar with
  search + notifications + avatar.
- **Map pages:** map fills the viewport; content panels are floating glass cards
  (desktop) or bottom sheets (mobile).
- **Grids:** feed 1-col mobile → 2-col with sidebar desktop; listings responsive
  card grid. Everything reflows; nothing horizontally scrolls the body.

## Theming

- Theme is stored in a cookie + `data-theme` on `<html>` and toggled without
  flash (inline script sets it before paint). Default follows
  `prefers-color-scheme`.
- Never hardcode hex in components — use tokens/Tailwind theme colors so both
  themes stay correct.

## Iconography & imagery

- **Icons:** `lucide-react`, 1.5px stroke, sized 16/20/24.
- **Images:** always `next/image`; court/profile media via Cloudinary transforms
  (responsive `srcset`, `f_auto,q_auto`). Provide `alt` text always.

## Accessibility checklist (per screen)

- Semantic landmarks (`header/nav/main/aside`).
- Keyboard reachable + logical focus order.
- AA contrast in both themes.
- Labeled inputs and controls; error text tied via `aria-describedby`.
- Motion respects `prefers-reduced-motion`.
- Live regions for realtime updates (new message, occupancy change).
