import { randomBytes } from "crypto";
import { redis } from "./redis.js";

export const VALID_CODES = [
  "jols123",
  "kian123",
  "jimel123",
  "james123",
  "jaymarc123",
  "mathew123",
];

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365; // effectively "stay signed in"

/**
 * Redeems a one-time code. Returns a session token on success, null
 * otherwise (invalid code, or already used). Redemption is atomic: the
 * code's Redis key is deleted, and only the caller who actually removes it
 * wins — a second, simultaneous attempt with the same code sees it gone.
 */
export async function redeemCode(code) {
  if (!redis) return randomBytes(24).toString("hex"); // gate disabled if Redis isn't set up
  if (typeof code !== "string" || !VALID_CODES.includes(code)) return null;

  const removed = await redis.del(`code:${code}`);
  if (removed === 0) return null; // already used

  const token = randomBytes(24).toString("hex");
  await redis.set(`session:${token}`, "1", { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function isValidSession(token) {
  if (!redis) return true; // gate disabled if Redis isn't set up
  if (typeof token !== "string" || token.length === 0) return false;
  return (await redis.exists(`session:${token}`)) === 1;
}
