import { SYSTEM_PROMPT } from "../proposal-context.js";
import { isValidSession } from "./_lib/codes.js";
import { streamAnswer } from "./_lib/complete.js";

const MAX_HISTORY_MESSAGES = 20;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  if (!(await isValidSession(req.headers["x-access-code"]))) {
    res
      .status(401)
      .json({ error: "Invalid or expired session — please re-enter your access code." });
    return;
  }

  const { question, history } = req.body ?? {};

  if (typeof question !== "string" || question.trim() === "") {
    res.status(400).json({ error: "question is required" });
    return;
  }

  const priorMessages = Array.isArray(history)
    ? history
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .slice(-MAX_HISTORY_MESSAGES)
    : [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...priorMessages,
    { role: "user", content: question },
  ];

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  await streamAnswer(messages, res);
}
