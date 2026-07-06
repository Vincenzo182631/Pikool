import bcrypt from "bcryptjs";

/**
 * Password hashing. Uses bcrypt (pure-JS, zero native build dependency) so the
 * app builds and runs everywhere. The documented target is argon2id
 * (docs/09-authentication.md); swapping to `@node-rs/argon2` is a drop-in
 * change behind these two functions.
 */
const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
