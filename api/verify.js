import { isValidSession } from "./_lib/codes.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const { token } = req.body ?? {};

  try {
    const ok = await isValidSession(token);
    res.status(ok ? 200 : 401).json({ ok });
  } catch (err) {
    console.error("verify error:", err);
    res.status(503).json({ ok: false, error: "temporarily unavailable" });
  }
}
