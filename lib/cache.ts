/**
 * How long a prerendered page may sit before Next.js rebuilds it on its own.
 *
 * Every rebuild is an ISR write, and Vercel's free tier includes 200,000 of
 * them a month. The arithmetic is unforgiving, and it is worth spelling out
 * because nothing in the code makes it visible:
 *
 *   - A page whose shortest cached read revalidates every 60 seconds costs
 *     1,440 writes a day *by itself*.
 *   - The window is inherited by the whole route. The lowest `revalidate` of
 *     any fetch reachable from a layout sets the frequency for every page
 *     beneath it, so one 60-second read in the root layout re-prices the
 *     entire site.
 *   - Writes are driven by requests, not by visitors. Crawlers sweeping the
 *     sitemap keep hundreds of URLs permanently warm, and three locales over
 *     the products, collections, menus and articles here is a prerendered
 *     surface in the hundreds.
 *
 * That combination — 60s in `lib/sanity/client.ts`, reached from
 * `app/[lang]/layout.tsx` — is what put this project through 150,000 writes.
 *
 * So nothing revalidates on a clock any more. Every cached read is tagged, the
 * CMS and the shop both post to `/api/revalidate/*` when something actually
 * changes, and this constant is only the backstop for when they don't: a
 * webhook that was never configured, or whose secret has rotated, costs the
 * site a day of staleness rather than permanent staleness.
 *
 * Lower it if you have a reason to, but know the price: halving the window
 * doubles the bill, across every page that reads the source you changed.
 */
export const CACHE_BACKSTOP_SECONDS = 60 * 60 * 24;
