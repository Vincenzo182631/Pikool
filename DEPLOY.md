# Deploying PicklePlay to Vercel

A step-by-step guide to a live, shareable preview. ~10 minutes.

You need two free accounts: **Neon** (PostgreSQL) and **Vercel** (hosting).

---

## 1. Create the database (Neon)

1. Go to <https://neon.tech> → sign up → **Create project** (any region near you).
2. On the project dashboard, open **Connection Details**. You need two URLs:
   - **Pooled** connection string → this is `DATABASE_URL`
     (it contains `-pooler` in the host).
   - **Direct** connection string → this is `DIRECT_URL`
     (toggle off "Pooled connection" to reveal it — no `-pooler`).
3. Keep both handy for step 3.

> Migrations run at build time via the direct URL; the app queries via the
> pooled URL. Both are required.

---

## 2. Import the repo into Vercel

1. Go to <https://vercel.com> → sign up (with GitHub) → **Add New… → Project**.
2. Import the **`Vincenzo182631/Pikool`** repository.
3. **Root directory:** leave as the repo root.
4. **Framework preset:** Next.js (auto-detected). Build settings are already
   defined in `vercel.json` — no changes needed.
5. Before clicking Deploy, expand **Environment Variables** and add the ones
   below (step 3).
6. Set the **Production branch** to `claude/project-docs-structure-edcmwn`
   (Settings → Git → Production Branch) — or merge that branch to `main` first.

---

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)

Required:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `JWT_ACCESS_SECRET` | a long random string (48+ chars) |
| `JWT_REFRESH_SECRET` | a different long random string |

Optional (enable more features):

| Key | Value | Enables |
|-----|-------|---------|
| `RESEND_API_KEY` | Resend API key | Real OTP verification emails |
| `EMAIL_FROM` | e.g. `PicklePlay <onboarding@resend.dev>` | Email sender |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary creds | Profile/cover photo uploads |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Google Maps key | Interactive map (later phase) |

> `APP_URL` is optional — the app auto-uses Vercel's URL. You don't need to set it.

---

## 4. Deploy

Click **Deploy**. Vercel runs `pnpm vercel-build`, which:
`prisma generate` → `prisma migrate deploy` (creates all tables) → `next build`.

First build takes a couple of minutes.

---

## 5. Seed the database (one time)

The schema is created by the build, but reference data (badges, sample courts,
and the demo account) needs seeding once. Two options:

**Option A — let me do it:** paste your Neon **DATABASE_URL** into the chat and
I'll run `prisma migrate deploy` + `pnpm db:seed` against it from here.

**Option B — do it yourself** (needs Node 22 + pnpm locally):
```bash
git clone <repo> && cd Pikool
git checkout claude/project-docs-structure-edcmwn
pnpm install
DATABASE_URL="<neon-pooled-url>" DIRECT_URL="<neon-direct-url>" pnpm db:seed
```

---

## 6. Log in and explore

Once deployed + seeded, open your Vercel URL and sign in with the demo account:

- **Email:** `demo@pikool.app`
- **Password:** `DemoPickle123!`

(Pre-verified and onboarded, so you skip the email step.) You can also register a
brand-new account — with `RESEND_API_KEY` set you'll receive a real OTP;
without it, new-signup OTP codes appear only in the Vercel function logs.

> Remember to change/remove the demo account and rotate secrets before any real
> launch.
