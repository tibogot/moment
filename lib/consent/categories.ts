import { isAnalyticsConfigured } from "@/lib/analytics";
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

/**
 * The optional categories the site *actually uses* today — and therefore the
 * only ones the banner may ask about.
 *
 * Analytics when Google Analytics is configured (see lib/analytics.ts), and
 * nothing else: no advertising or social tag is installed. Asking a visitor to
 * accept a category that does not exist is misleading under the APD's
 * guidance, so with this list empty — a preview deployment, or production
 * before the measurement ID is set — the banner does not appear, the footer
 * shows no preferences button, and the cookies page says plainly that nothing
 * optional is set.
 *
 * Adding a tag: mount it in ConsentScripts behind its category, add the
 * category here, list its cookies on app/[lang]/cookies/page.tsx, and bump
 * CONSENT_VERSION so everyone is asked again.
 */
export const ENABLED_CONSENT_CATEGORIES: readonly ConsentCategory[] =
  isAnalyticsConfigured() ? ["analytics"] : [];
