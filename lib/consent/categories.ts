import type { ConsentCategory } from "@/lib/consent/types";

/**
 * The optional categories, in the order the preferences panel lists them.
 *
 * Ids only. What each is called and how it is explained lives in the
 * dictionaries under `cookies.categories`, keyed by the same id — a consent
 * banner has to be readable in the visitor's language to be worth anything.
 *
 * These ids are written into the consent cookie and read back for a year, so
 * renaming one silently invalidates every choice already recorded.
 */
export const OPTIONAL_CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  "analytics",
  "marketing",
];
