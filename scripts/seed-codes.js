// Seeds the 6 one-time access codes into Redis. Run this exactly once —
// re-running it will re-enable any codes that have already been used.
import "dotenv/config";
import { redis } from "../api/_lib/redis.js";
import { VALID_CODES } from "../api/_lib/codes.js";

if (!redis) {
  console.error(
    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — nothing to do.",
  );
  process.exit(1);
}

for (const code of VALID_CODES) {
  await redis.set(`code:${code}`, "1");
  console.log(`seeded: ${code}`);
}

console.log("Done.");
