import { createClient } from "next-sanity";
import { CACHE_BACKSTOP_SECONDS } from "../cache";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "./env";

export const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: true,
});

/**
 * The document types the site reads, which are also its cache tags.
 *
 * Keeping the tag equal to the `_type` is what lets the webhook stay dumb: it
 * projects `{"tags": [_type]}` and does no mapping, so adding a document type
 * to the site means adding it here and to the webhook's GROQ filter, and
 * nothing else.
 *
 * The indirection that does exist is on the read side. `article` queries also
 * tag `author` and `category`, because they dereference both — renaming an
 * author has to rebuild the article pages that print their name, and a webhook
 * firing `author` is what tells them to.
 */
export const SANITY_TAGS = [
  "siteSettings",
  "homePage",
  "menu",
  "article",
  "author",
  "category",
] as const;

export type SanityTag = (typeof SANITY_TAGS)[number];

export function isSanityTag(value: unknown): value is SanityTag {
  return (
    typeof value === "string" && SANITY_TAGS.includes(value as SanityTag)
  );
}

/**
 * Fetch options for a tagged, on-demand-revalidated Sanity read.
 *
 * There is deliberately no way to ask for a shorter window. Time-based
 * revalidation is what this replaced — see `lib/cache.ts` for what it cost —
 * and a caller reaching for "just this one query, every minute" would put the
 * whole route back on that clock.
 */
export function sanityCache(...tags: SanityTag[]) {
  return {
    next: {
      revalidate: CACHE_BACKSTOP_SECONDS,
      tags: [...tags],
    },
  };
}
