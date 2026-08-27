import { redis } from "./redis.js";

const MAX_ATTEMPTS = 3;
const WINDOW_SECONDS = 60 * 60; // 1 hour

export function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export async function isLockedOut(ip) {
  if (!redis) return false;
  const count = await redis.get(`attempts:${ip}`);
  return Number(count) >= MAX_ATTEMPTS;
}

/** Records a failed attempt; the 1-hour window starts from the first failure. */
export async function recordFailedAttempt(ip) {
  if (!redis) return;
  const key = `attempts:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
}

export async function clearAttempts(ip) {
  if (!redis) return;
  await redis.del(`attempts:${ip}`);
}
