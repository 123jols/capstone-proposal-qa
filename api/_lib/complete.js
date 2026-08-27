import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { reserveGroq, reserveGemini } from "./budget.js";

const GROQ_MODEL = "openai/gpt-oss-120b";
const GEMINI_MODEL = "gemini-3.6-flash";
const MAX_TOKENS = 1024;
const GEMINI_MAX_TOKENS = 2048; // Gemini's "thinking" tokens count against this budget

async function streamGroq(messages, res, onWrite) {
  const client = new Groq();
  const stream = await client.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      onWrite();
      res.write(text);
    }
  }
}

async function streamGemini(messages, res, onWrite) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const systemMessage = messages.find((m) => m.role === "system");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const stream = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: systemMessage?.content,
      maxOutputTokens: GEMINI_MAX_TOKENS,
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      onWrite();
      res.write(chunk.text);
    }
  }
}

function sendFatalError(res, status, message) {
  if (!res.headersSent) res.status(status);
  res.end(`\n\n[Error: ${message}]`);
}

/**
 * Streams an AI answer to `res` (caller must already have set text/plain
 * streaming headers). Reserves a slot against Groq's per-minute token budget
 * first; if that budget (or Groq itself) is unavailable, tries Gemini next.
 * If both providers are genuinely out of capacity and nothing has streamed
 * yet, responds with a 429 + { queued: true, retryAfterMs } instead of an
 * error, so the client can wait and retry automatically.
 */
export async function streamAnswer(messages, res) {
  let wroteAny = false;
  const onWrite = () => {
    wroteAny = true;
  };

  const groqSlot = await reserveGroq();

  if (groqSlot.ok) {
    try {
      await streamGroq(messages, res, onWrite);
      res.end();
      return;
    } catch (groqError) {
      const isRateLimited = groqError?.status === 429;
      if (!isRateLimited || wroteAny) {
        console.error("Groq API error:", groqError);
        sendFatalError(
          res,
          groqError instanceof Groq.APIError ? groqError.status ?? 500 : 500,
          groqError instanceof Error ? groqError.message : "Something went wrong talking to the AI.",
        );
        return;
      }
      // Groq rate-limited us despite our reservation — fall through to Gemini.
    }
  }

  if (process.env.GEMINI_API_KEY) {
    const geminiSlot = await reserveGemini();

    if (geminiSlot.ok) {
      try {
        await streamGemini(messages, res, onWrite);
        res.end();
        return;
      } catch (geminiError) {
        if (wroteAny) {
          console.error("Gemini fallback error:", geminiError);
          sendFatalError(res, 500, "Something went wrong talking to the AI.");
          return;
        }
        // Gemini also failed before writing anything — fall through to queued response.
      }
    }
  }

  // Both providers are out of capacity right now. Tell the client to wait
  // and retry instead of showing an error.
  const retryAfterMs = groqSlot.retryAfterMs ?? 5000;
  if (!res.headersSent) {
    res.setHeader("Content-Type", "application/json");
    res.status(429).json({ queued: true, retryAfterMs });
  } else {
    sendFatalError(res, 500, "Something went wrong talking to the AI.");
  }
}
