import { DEFAULT_LOCALE, LOCALES } from "./i18n/config";

/**
 * Who the site is, split by who gets to change it.
 *
 * `siteConfig` is deployment and brand: the canonical origin, the name, the
 * fallback description. It stays in code because changing any of it is a
 * developer's job — `url` alone is wired into `metadataBase`, robots, the
 * sitemap and the Shopify OAuth redirect, and a typo there takes the site off
 * the internet.
 *
 * `SiteDetails` is the company: address, phone, VAT, social accounts. These
 * are hardcoded rather than kept in the Sanity Studio — see the note on
 * `SITE_DETAILS` for why that is the better trade.
 *
 * The languages are *not* restated here. They come from `lib/i18n/config`, so
 * a second copy cannot drift and have the JSON-LD tell Google the site's
 * primary language is English, on a site whose whole case for existing is
 * ranking in French.
 */
/**
 * Where this deployment actually lives.
 *
 * Every canonical URL, the sitemap, robots.txt, the Open Graph image and every
 * `@id` in the JSON-LD are built from this. A wrong value tells search engines
 * that the real version of every page is somewhere that does not resolve,
 * which is worse than saying nothing at all.
 *
 * The domain is **moment-lab.be**, confirmed by the owners. `moment.be` was
 * never theirs and is not coming; anything in
 * the repo still naming it is out of date.
 *
 * `NEXT_PUBLIC_SITE_URL` is the supported way to set it, and the only one that
 * works in the browser bundle as well as on the server — this module is
 * imported by Client Components. The Vercel variables below are a safety net
 * for a deployment where nobody remembered: the `NEXT_PUBLIC_` one exists only
 * if "Automatically expose System Environment Variables" is on, the bare one
 * always exists on Vercel but is server-only.
 *
 * The day the domain resolves, this is one environment variable to change:
 * `NEXT_PUBLIC_SITE_URL=https://www.moment-lab.be`.
 */
function resolveSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (!configured) return "http://localhost:3000";

  // Vercel's variables are bare hostnames; a hand-set one usually is not.
  const withProtocol = /^https?:\/\//.test(configured)
    ? configured
    : `https://${configured}`;

  return withProtocol.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Moment",
  url: resolveSiteUrl(),
  defaultLocale: DEFAULT_LOCALE,
  locales: LOCALES,
  description:
    "Traiteur in Brussels — catering for private hosts and companies, event service, and a coffee desk.",
} as const;

/**
 * Whether search engines should be allowed to index this deployment at all.
 *
 * Derived from the address rather than set by hand, because the failure mode of
 * a flag nobody remembers is silent and expensive: a preview or a `.vercel.app`
 * production URL indexed before the real domain exists leaves a pile of results
 * pointing at an address the business will abandon, and a duplicate-content
 * problem to clean up on the domain it actually wants to rank on.
 *
 * So: a real domain is indexable, everything else is not, and the day
 * `NEXT_PUBLIC_SITE_URL` points at moment-lab.be indexing switches itself on.
 */
export const siteIsIndexable =
  !siteConfig.url.includes("localhost") &&
  !siteConfig.url.endsWith(".vercel.app");

/**
 * The company's own facts.
 *
 * Everything is a string and everything may be empty. Empty is a real state
 * here — it means "not supplied yet" — and the places that render these already
 * drop blanks rather than printing a label with nothing after it. See the
 * `compact` helper in `lib/schema.ts`.
 */
export type SiteDetails = {
  contact: {
    street: string;
    postalCode: string;
    city: string;
    region: string;
    country: string;
    phone: string;
    email: string;
  };
  /**
   * When a human answers, in 24-hour `HH:MM`. Not the delivery calendar and not
   * the pickup window — this is the reachable-by-phone-and-email hours, and it
   * is what the `openingHoursSpecification` in the JSON-LD publishes. The
   * kitchen's delivery days live in the Shopify admin; see `lib/delivery/dates.ts`.
   */
  hours: {
    opensAt: string;
    closesAt: string;
  };
  legal: {
    companyName: string;
    /** BCE enterprise number (10 digits) — required on the legal page. */
    enterpriseNumber: string;
    /** Belgian VAT number, e.g. BE0123456789 */
    vatNumber: string;
    legalForm: string;
    /**
     * The registered office (siège social) as filed with the BCE — which is
     * not the atelier. Belgian law wants the seat on the legal notice and as
     * the data controller's address; the atelier is where the company
     * operates, and is what everything customer-facing prints.
     */
    registeredOffice: { street: string; postalCode: string; city: string };
  };
  social: {
    instagram: string;
    facebook: string;
  };
};

/**
 * The company's facts, as given by the owners. **The single source of truth —
 * there is no CMS copy of any of this.**
 *
 * A Studio copy merged over defaults here would put the same fact in two
 * places, and a precedence rule between them buys bugs and no benefit: if a
 * non-empty Studio field wins, an owner who clears a phone number in the
 * Studio sends an empty string that reads as "not an answer", and watches the
 * hardcoded number stay on the site.
 *
 * The cost, accepted knowingly: changing any of these is a code change and a
 * deploy rather than a field an owner can edit. For facts that move once every
 * few years — an address, a VAT number, a legal form — that is the cheaper
 * side of the trade, and the Studio holds only things that genuinely change:
 * menus, news, the home page images.
 *
 * The BCE number 1036.670.672 is the enterprise number; the VAT number is the
 * same ten digits with `BE` in front, which is how Belgium works and why there
 * are two fields holding one fact.
 *
 * The registered denomination (MOMENT LAB SRL) and the social accounts
 * (@moment.brussels on both) are the client's own answers. Every consumer
 * drops a blank rather than printing a label with
 * nothing after it, so emptying one of these is safe.
 */
export const SITE_DETAILS: SiteDetails = {
  contact: {
    street: "Rue des Glands 21A",
    postalCode: "1190",
    city: "Forest",
    region: "Brussels-Capital",
    country: "Belgium",
    phone: "+32 472 35 51 53",
    email: "info@moment-lab.be",
  },
  hours: {
    opensAt: "08:00",
    closesAt: "16:00",
  },
  legal: {
    companyName: "MOMENT LAB",
    enterpriseNumber: "1036.670.672",
    vatNumber: "BE1036670672",
    legalForm: "SRL",
    // BCE, checked 6 November 2026: seat in Meise, the single establishment
    // unit at Rue des Glands 21A, Forest.
    registeredOffice: {
      street: "Humbeekstraat 17",
      postalCode: "1860",
      city: "Meise",
    },
  },
  social: {
    instagram: "https://www.instagram.com/moment.brussels/",
    facebook: "https://www.facebook.com/moment.brussels/",
  },
};

/**
 * The atelier on one line — "Rue des Glands 21A, 1190 Forest".
 *
 * Blank parts drop out rather than leaving a stray comma, because every one of
 * these is a Studio field an owner can empty. The country is left off on
 * purpose: this is written into FAQ answers and collection instructions read by
 * people who are about to drive there, and none of them need telling it is in
 * Belgium. `postalAddress` in `lib/schema.ts` is the structured form, and that
 * one does carry the country, because a search engine does need telling.
 */
export function formatAddressLine(details: SiteDetails) {
  const { street, postalCode, city } = details.contact;
  const locality = [postalCode, city].filter(Boolean).join(" ");

  return [street, locality].filter(Boolean).join(", ");
}

/** "08:00 – 16:00", matching how the delivery windows are written. */
export function formatOpeningHours(details: SiteDetails) {
  const { opensAt, closesAt } = details.hours;
  if (!opensAt || !closesAt) return "";

  return `${opensAt} – ${closesAt}`;
}
