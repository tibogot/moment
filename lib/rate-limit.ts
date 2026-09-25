/**
 * A per-visitor request budget, kept in the memory of the server instance.
 *
 * Honest about what it is: every instance counts on its own, and a cold start
 * forgets. It will not stop a distributed attack. What it does stop is the
 * cheap case, one script in a loop, which is the one that would otherwise
 * spend Geoapify's 3,000 free lookups a day or fill the kitchen's inbox.
 * The durable answer is a rate-limit rule in Vercel's firewall, in front of
 * all of this — see AFTER-LAUNCH.md.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Past this many tracked visitors, expired entries are swept before adding. */
const SWEEP_AT = 5_000;

export type RateLimit = { limit: number; windowMs: number };

/** True if the request may go ahead, and counts it. */
export function takeToken(key: string, { limit, windowMs }: RateLimit) {
  const now = Date.now();

  if (buckets.size >= SWEEP_AT) {
    for (const [entry, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(entry);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * The visitor's address as the platform reports it. Vercel puts the client
 * first in `x-forwarded-for`; anything missing collapses into one shared
 * bucket, which errs towards limiting rather than letting it through.
 */
export function clientAddress(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
