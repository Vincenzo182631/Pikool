import { ApiError } from "@/lib/api";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { emailVerificationRequired } from "@/lib/email";

/** Require an authenticated (and, when enforced, email-verified) user. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("UNAUTHENTICATED", "You must be signed in.");
  if (emailVerificationRequired && !user.emailVerified) {
    throw new ApiError("FORBIDDEN", "Please verify your email to continue.");
  }
  return user;
}

/** Require the user to hold at least one of the given roles (ADMIN always passes). */
export async function requireRole(...roles: string[]): Promise<CurrentUser> {
  const user = await requireUser();
  const held = new Set(user.roles.map((r) => r.role));
  if (held.has("ADMIN")) return user;
  if (!roles.some((r) => held.has(r as never))) {
    throw new ApiError("FORBIDDEN", "You don't have permission to do that.");
  }
  return user;
}
