import * as argon2 from "argon2";

/**
 * Hash a plain-text password using Argon2id.
 * Uses the default config (memory cost, time cost, parallelism) which is
 * cryptographically strong and future-proof.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

/**
 * Verify a plain-text password against an Argon2 hash.
 * Returns `true` if the password matches, `false` otherwise.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}
