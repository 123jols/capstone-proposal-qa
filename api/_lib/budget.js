import { redis } from "./redis.js";

// Groq free tier: ~8000 tokens/minute. Each request costs roughly 3500
// (system prompt) + history + up to 1024 (completion) tokens — budget
// conservatively so concurrent requests queue instead of getting a 429.
const GROQ_TPM_BUDGET = 7000;
const GROQ_WINDOW_SECONDS = 60;
const GROQ_EST_TOKENS_PER_REQUEST = 5000;

// Gemini free tier: 20 requests/day for this model. Leave a small margin.
const GEMINI_DAILY_BUDGET = 18;
const GEMINI_WINDOW_SECONDS = 60 * 60 * 24;

async function reserve(key, windowSeconds, amount, budget) {
  if (!redis) return { ok: true };

  const total = await redis.incrby(key, amount);
  if (total === amount) {
    await redis.expire(key, windowSeconds);
  }

  if (total <= budget) return { ok: true };

  await redis.decrby(key, amount);
  const ttl = await redis.ttl(key);
  return { ok: false, retryAfterMs: Math.max(ttl, 1) * 1000 };
}

export async function reserveGroq() {
  return reserve(
    "budget:groq-tpm",
    GROQ_WINDOW_SECONDS,
    GROQ_EST_TOKENS_PER_REQUEST,
    GROQ_TPM_BUDGET,
  );
}

export async function reserveGemini() {
  return reserve("budget:gemini-daily", GEMINI_WINDOW_SECONDS, 1, GEMINI_DAILY_BUDGET);
}
