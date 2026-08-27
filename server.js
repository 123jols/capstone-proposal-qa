import "dotenv/config";
import express from "express";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";
import { SYSTEM_PROMPT } from "./proposal-context.js";
import { redeemCode, isValidSession } from "./api/_lib/codes.js";
import {
  getClientIp,
  isLockedOut,
  recordFailedAttempt,
  clearAttempts,
} from "./api/_lib/rateLimit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const MODEL = "openai/gpt-oss-120b";
const MAX_HISTORY_MESSAGES = 20;

app.post("/api/redeem", async (req, res) => {
  const ip = getClientIp(req);

  if (await isLockedOut(ip)) {
    return res
      .status(429)
      .json({ ok: false, error: "Too many attempts. Try again in an hour." });
  }

  const { code } = req.body ?? {};
  const token = await redeemCode(typeof code === "string" ? code.trim() : code);

  if (!token) {
    await recordFailedAttempt(ip);
    return res.status(401).json({ ok: false });
  }

  await clearAttempts(ip);
  res.status(200).json({ ok: true, token });
});

app.post("/api/verify", async (req, res) => {
  const ok = await isValidSession(req.body?.token);
  res.status(ok ? 200 : 401).json({ ok });
});

app.post("/api/ask", async (req, res) => {
  if (!(await isValidSession(req.headers["x-access-code"]))) {
    return res.status(401).json({
      error: "Invalid or expired session — please re-enter your access code.",
    });
  }

  const { question, history } = req.body ?? {};

  if (typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ error: "question is required" });
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

  try {
    const client = new Groq();
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) res.write(text);
    }

    res.end();
  } catch (error) {
    console.error("Groq API error:", error);
    if (!res.headersSent) {
      const status = error instanceof Groq.APIError ? error.status ?? 500 : 500;
      res.status(status);
    }
    res.end(
      `\n\n[Error: ${error instanceof Error ? error.message : "Something went wrong talking to the AI."}]`,
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Capstone proposal Q&A running at http://localhost:${PORT}`);
});
