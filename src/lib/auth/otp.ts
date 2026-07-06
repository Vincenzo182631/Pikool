import { createHash, randomInt } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Generate a 6-digit numeric OTP. */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Hash an OTP for storage (never store the plaintext code). */
export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Constant-time-ish comparison of a submitted code against a stored hash. */
export function verifyOtp(code: string, storedHash: string): boolean {
  return hashOtp(code) === storedHash;
}
