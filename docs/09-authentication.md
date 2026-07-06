# 09 — Authentication & Authorization

**Model:** JWT access/refresh tokens, email verification via OTP (required),
social login (Google/Apple/Facebook), argon2id password hashing, role-based
access control. Endpoints in [`06-api-specification.md`](./06-api-specification.md#auth----apiauth).

## Principles

- **Email verification is mandatory** before any member action.
- **Never trust the client.** Every protected route re-checks auth + roles +
  ownership on the server.
- **Least privilege.** Roles grant only what the story requires.
- **Secrets never logged.** Passwords/tokens/OTPs are hashed at rest.

## Token strategy

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| **Access** | 15 min | memory / `Authorization` header | Authorize API calls |
| **Refresh** | 30 days (rotating) | httpOnly, Secure, SameSite=Lax cookie | Mint new access tokens |

- Access token is a signed JWT: `{ sub, roles, emailVerified, iat, exp }`,
  signed with `JWT_ACCESS_SECRET` (HS256 or RS256).
- Refresh tokens are **rotated** on every use; the previous token is invalidated
  (stored hashed in `Session`). Reuse of a rotated token → revoke the whole
  session family (theft detection).
- Logout deletes the session row and clears the cookie.

## Sign-up flow

1. `POST /auth/signup` `{ email, password, confirmPassword, acceptedTerms }`.
2. Validate (Zod): password strength, matching confirm, terms = true, email
   format + uniqueness.
3. Hash password (argon2id), create `User` (`emailVerified = null`).
4. Generate a 6-digit **OTP**, store **hashed** in `VerificationToken`
   (`purpose=EMAIL_VERIFY`, expires 10 min), email it via Resend.
5. `POST /auth/verify-email` `{ email, code }` → compare hash, mark
   `emailVerified = now`, consume token, issue tokens.
6. `POST /auth/resend-otp` is rate-limited (e.g. 3 / 15 min) and invalidates
   prior codes.

**Account is inactive** (cannot call member endpoints) until `emailVerified`.

## Login flow

1. `POST /auth/login` `{ email, password, remember }`.
2. Verify argon2 hash (constant-time). Generic error on failure (no
   user-enumeration).
3. If email unverified → `403` with `code=EMAIL_UNVERIFIED` and offer resend.
4. Issue access + refresh; `remember` extends refresh cookie max-age.
5. Rate-limit by IP + email; lock/slow after repeated failures.

## Social login (OAuth)

- Providers: **Google, Apple, Facebook**. `POST /auth/oauth/:provider` with the
  provider token/code.
- Server verifies with the provider, then:
  - If an `Account` exists → log in.
  - Else if email matches an existing verified `User` → link `Account`.
  - Else create `User` (mark `emailVerified` from the provider's verified email)
    + `Account`, then route to onboarding.
- All OAuth users still complete onboarding for pickleball-specific fields.

## Password reset

1. `POST /auth/forgot-password` `{ email }` → always respond `200` (no
   enumeration); if user exists, email an OTP (`purpose=PASSWORD_RESET`, 10 min).
2. `POST /auth/reset-password` `{ email, code, newPassword }` → verify hashed
   code, set new hash, revoke all sessions, consume token.

## Password policy

- Min 10 chars, must include mixed character classes; reject common/breached
  passwords (zxcvbn score gate). Argon2id with sane params (memory-hard).
- Never store or log plaintext; never return the hash.

## Roles & RBAC

Roles (from `02`): `PLAYER`, `VERIFIED_COACH`, `CLUB_OWNER`, `STORE_OWNER`,
`COURT_OWNER`, `TOURNAMENT_ORGANIZER`, `ADMIN`. Stored in `UserRole` (a user may
hold several). Effective permissions = union of roles.

Permission checks combine **role** and **ownership**:
- `withAuth()` → requires a valid, verified session.
- `withRole(...roles)` → requires at least one listed role.
- `withOwnership(resource)` → the acting user owns the resource (or is `ADMIN`).

Example matrix (abridged):

| Action | Required |
|--------|----------|
| Check in, post, message, record match | `PLAYER` (any verified member) |
| Create/manage a court listing | `COURT_OWNER` (owner) or `ADMIN` |
| Create/manage a store | `STORE_OWNER` (owner) or `ADMIN` |
| Create tournament, generate bracket, enter scores | `TOURNAMENT_ORGANIZER` (owner) or `ADMIN` |
| Manage a club | `CLUB_OWNER`/club admin or `ADMIN` |
| Coach-only listings, verified badge | `VERIFIED_COACH` |
| Moderation, analytics, role grants | `ADMIN` |

`VERIFIED_COACH`, `COURT_OWNER`, `STORE_OWNER`, `TOURNAMENT_ORGANIZER` are granted
via an application/verification flow reviewed by admins (see `13`).

## Middleware & enforcement

- Next.js middleware resolves the session for `(app)` and `admin` route groups;
  unauthenticated → redirect to `/login` (pages) or `401` (API).
- Route handlers compose `withAuth` / `withRole` / `withOwnership` +
  `withValidation` (`04`, `06`).
- Admin routes additionally require `ADMIN` and log every mutating action to an
  audit trail.

## Sessions & devices

- `Session` rows track device/user-agent/IP; users can view and revoke sessions
  in settings. Global "log out everywhere" revokes all refresh tokens.

## Security cross-refs

CSRF, headers, rate limits, and hardening details are in
[`16-security.md`](./16-security.md).
