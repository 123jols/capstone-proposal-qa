import { codeMatches } from "./_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const { code } = req.body ?? {};
  const ok = codeMatches(code);
  res.status(ok ? 200 : 401).json({ ok });
}
