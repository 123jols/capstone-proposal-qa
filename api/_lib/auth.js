import { timingSafeEqual } from "crypto";

export function codeMatches(provided) {
  const expected = process.env.ACCESS_CODE;
  if (!expected) return true; // no code configured — gate disabled

  if (typeof provided !== "string" || provided.length === 0) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
