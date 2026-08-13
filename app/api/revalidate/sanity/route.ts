/**
 * The Sanity end of on-demand revalidation.
 *
 * Nothing on this site is rebuilt on a timer any more — see `lib/cache.ts` for
 * why — so this route is how published content reaches the public pages. A
 * GROQ-powered webhook in the Studio's project settings posts here on every
 * publish; the tags it names are the tags `sanityCache()` attached to the
 * queries, so invalidating one rebuilds exactly the pages that read it.
 *
 * Configure it at sanity.io/manage → API → Webhooks:
 *
 *   URL:        https://<your-domain>/api/revalidate/sanity
 *   Dataset:    production
 *   Trigger on: Create, Update, Delete
 *   Filter:     _type in ["siteSettings", "homePage", "menu", "article", "author", "category"]
 *   Projection: {"tags": [_type]}
 *   Secret:     the value of SANITY_REVALIDATE_SECRET
 *
 * The projection is deliberately just the document's own type. The fan-out —
 * an author rename reaching the article pages that print their name — lives in
 * the tags on the queries, where it can be read next to the GROQ that causes
 * it, rather than in a mapping table here that nobody would think to update.
 */

import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { isSanityTag } from "@/lib/sanity/client";

type WebhookPayload = { tags?: unknown };

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  // Refusing rather than accepting unsigned posts. An unset secret is a
  // deployment mistake, and the failure mode of guessing the other way is a
  // public endpoint that lets anyone force-rebuild every page on the site.
  if (!secret) {
    console.error(
      "[revalidate] SANITY_REVALIDATE_SECRET is not set; webhook rejected",
    );
    return NextResponse.json(
      { revalidated: [], message: "Revalidation secret is not configured" },
      { status: 500 },
    );
  }

  let isValidSignature: boolean | null;
  let body: WebhookPayload | null;

  try {
    // The third argument waits out Content Lake's eventual consistency. The
    // webhook fires before Sanity's CDN has the new document, and the client
    // reads with `useCdn: true`, so without this the rebuild it triggers can
    // fetch and re-cache the *old* content — a stale page that now looks
    // freshly generated.
    ({ isValidSignature, body } = await parseBody<WebhookPayload>(
      request,
      secret,
      true,
    ));
  } catch (error) {
    console.error("[revalidate] could not parse Sanity webhook body", error);
    return NextResponse.json(
      { revalidated: [], message: "Malformed webhook payload" },
      { status: 400 },
    );
  }

  if (!isValidSignature) {
    return NextResponse.json(
      { revalidated: [], message: "Invalid signature" },
      { status: 401 },
    );
  }

  // Filtered against the known tags rather than passed through. The webhook is
  // signed, so this is not a trust boundary; it is a typo boundary. A filter
  // widened in the Studio to a type the site never queries would otherwise
  // register a tag that can never match anything, and fail silently.
  const tags = Array.isArray(body?.tags) ? body.tags.filter(isSanityTag) : [];

  if (tags.length === 0) {
    return NextResponse.json(
      { revalidated: [], message: "No known tags in payload" },
      { status: 400 },
    );
  }

  // `{ expire: 0 }` rather than the "max" profile: that one marks the tag stale
  // and serves the old page to whoever asks next, which is right for a Server
  // Action that already knows what changed. Here an editor has hit Publish and
  // is about to reload the page to check it, so the next request should block
  // on fresh content instead of showing them the version they just replaced.
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: tags, now: Date.now() });
}
