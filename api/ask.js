import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "../proposal-context.js";

const MODEL = "openai/gpt-oss-120b";
const MAX_HISTORY_MESSAGES = 20;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
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

  try {
    const client = new Groq();
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 2048,
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
}
