import { redeemCode } from "./_lib/codes.js";
import {
  getClientIp,
  isLockedOut,
  recordFailedAttempt,
  clearAttempts,
} from "./_lib/rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const ip = getClientIp(req);

  if (await isLockedOut(ip)) {
    res
      .status(429)
      .json({ ok: false, error: "Too many attempts. Try again in an hour." });
    return;
  }

  const { code } = req.body ?? {};
  const token = await redeemCode(typeof code === "string" ? code.trim() : code);

  if (!token) {
    await recordFailedAttempt(ip);
    res.status(401).json({ ok: false });
    return;
  }

  await clearAttempts(ip);
  res.status(200).json({ ok: true, token });
}
