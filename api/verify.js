import { isValidSession } from "./_lib/codes.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const { token } = req.body ?? {};
  const ok = await isValidSession(token);
  res.status(ok ? 200 : 401).json({ ok });
}
