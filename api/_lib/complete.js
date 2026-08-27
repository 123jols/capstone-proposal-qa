import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

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

async function streamGemini(messages, res) {
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
    if (chunk.text) res.write(chunk.text);
  }
}

/**
 * Streams an AI answer to `res` (caller must already have set text/plain
 * streaming headers). Tries Groq first; if Groq is rate-limited (429) and
 * nothing has been written yet, falls back to Gemini so the request still
 * succeeds instead of surfacing an error to the user.
 */
export async function streamAnswer(messages, res) {
  let wroteAny = false;

  try {
    await streamGroq(messages, res, () => {
      wroteAny = true;
    });
    res.end();
  } catch (groqError) {
    const isRateLimited = groqError?.status === 429;
    const canFallback =
      isRateLimited && !wroteAny && !!process.env.GEMINI_API_KEY;

    if (!canFallback) {
      console.error("Groq API error:", groqError);
      if (!res.headersSent) {
        res.status(
          groqError instanceof Groq.APIError ? groqError.status ?? 500 : 500,
        );
      }
      res.end(
        `\n\n[Error: ${groqError instanceof Error ? groqError.message : "Something went wrong talking to the AI."}]`,
      );
      return;
    }

    try {
      await streamGemini(messages, res);
      res.end();
    } catch (geminiError) {
      console.error("Gemini fallback error:", geminiError);
      if (!res.headersSent) res.status(500);
      res.end("\n\n[Error: Something went wrong talking to the AI.]");
    }
  }
}
