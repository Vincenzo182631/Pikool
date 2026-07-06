# 16 — Security

Security is a requirement, not a phase. This doc collects the controls that apply
across PicklePlay. Auth specifics are in [`09-authentication.md`](./09-authentication.md).

## Threat model (high level)

- Account takeover (credential stuffing, phishing, token theft).
- Broken access control (accessing/editing others' resources).
- Injection (SQL, XSS) and untrusted input.
- Abuse/spam (fake check-ins, rating manipulation, marketplace scams).
- Data exposure (PII, location, secrets).
- Denial of service / cost abuse (map/API/socket flooding).

## Authentication & sessions

- Argon2id password hashing; strength + breached-password checks (`09`).
- **Email verification required** before member actions.
- JWT access (15 min) + rotating refresh (httpOnly, Secure, SameSite=Lax cookie);
  refresh-token **reuse detection** revokes the session family.
- OAuth tokens verified server-side; accounts linked by verified email.
- "Log out everywhere"; session list with device/IP; revoke on password reset.

## Authorization (access control)

- **Every** protected endpoint re-checks auth + role + ownership server-side
  (`withAuth`/`withRole`/`withOwnership`). Never rely on hidden UI.
- Object-level checks: a user can only mutate resources they own (or admin).
- Socket room joins are authorization-checked (`11`).
- Admin routes require `ADMIN` and are audited (`13`).

## Input validation & output encoding

- **Validate every input** with Zod at the boundary (body, query, params) — one
  shared schema client + server (`06`).
- Prisma parameterizes queries (no string-built SQL). If raw SQL is ever needed,
  use parameter binding — never interpolate.
- **XSS:** React escapes by default; never use `dangerouslySetInnerHTML` with
  user content. Sanitize any rich text (allowlist) if introduced.
- File uploads go to **Cloudinary via signed** requests (`06`); validate
  type/size; never trust client-provided URLs for internal use.

## Rate limiting & abuse prevention

- **Rate limit every public endpoint** via Redis (per IP + per user + per route
  budgets). Return `429` + `Retry-After`.
- Stricter limits on auth, OTP send/verify, password reset, messaging, and
  listing creation.
- Socket connections rate-limited; ephemeral events (typing/presence) coalesced.
- **Anti-fraud:** QR-signed court check-ins (`10`); rating guardrails and
  duplicate/collusion detection (`12`); report + moderation pipeline (`13`).

## Transport & headers

- HTTPS everywhere (HSTS). Secure cookies.
- Security headers (via Next.js config / middleware): `Content-Security-Policy`
  (restrict script/connect/img/font sources incl. Google Maps + Cloudinary),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Permissions-Policy`
  (geolocation gated to self).
- **CSRF:** state-changing browser requests use SameSite cookies + a CSRF token
  (double-submit) or restrict cookie-auth to same-site; Bearer-token API calls are
  not cookie-CSRF-prone.
- CORS: allowlist known origins for the API and socket service.

## Secrets & configuration

- Secrets only in environment variables / platform secret managers — **never** in
  git. `.env.example` documents names, not values.
- Separate keys per environment; rotate on exposure.
- Google Maps: browser key restricted by HTTP referrer + APIs; server key
  restricted by IP (`10`, `17`).
- Least-privilege DB users; no shared admin credentials.

## Data protection & privacy

- Encrypt at rest (managed DB) and in transit.
- **Minimize PII**; never log secrets/tokens/passwords or precise location.
- **Location privacy:** users control profile/location visibility; "I'm
  Available" broadcasts are coarse (radius/cell), time-boxed, and revocable (`08`).
- Data subject rights: export + delete account (soft-delete then purge job).
- Retention: expire OTPs/tokens; purge stale check-ins; document retention windows.

## Dependencies & supply chain

- Pin versions; automated dependency audits (Dependabot / `pnpm audit`) in CI.
- Review new dependencies; avoid unmaintained packages.
- Lockfile committed; CI installs with `--frozen-lockfile`.

## Logging, monitoring & response

- Structured logs with request/user context (no secrets/PII).
- Alert on auth anomalies (spikes in failed logins, OTP abuse, 429s).
- Error monitoring (e.g. Sentry) with PII scrubbing.
- **Audit trail** for admin actions (`13`), immutable.
- Have a basic incident runbook: revoke keys, rotate secrets, invalidate sessions.

## Secure SDLC

- Security review on PRs touching auth, payments-adjacent, or access control.
- Tests for authz (can user A act on user B's resource? must fail), rate limits,
  and validation (`18`).
- Never merge with known high/critical vulnerabilities.

## Checklist (per feature)

- [ ] Inputs validated (Zod) server-side.
- [ ] AuthN + role + ownership enforced server-side.
- [ ] Rate-limited if public.
- [ ] No secrets/PII in logs or client.
- [ ] Output not vulnerable to XSS/injection.
- [ ] New env vars documented; keys scoped.
- [ ] Authz + abuse tests added.
