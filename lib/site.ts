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
 * `SiteDetails` is the company: address, phone, VAT, social accounts. Facts
 * about a business that its owners know and we do not, which is why they are
 * edited in the Studio and read through `getSiteDetails`. The values below are
 * what applies until they are.
 *
 * The languages are *not* restated here. They used to be, and the copy said
 * `defaultLocale: "en"` while `lib/i18n/config` said `fr` — so the JSON-LD told
 * Google the site's primary language was English, on a site whose whole case
 * for existing is ranking in French.
 */
/**
 * Where this deployment actually lives.
 *
 * Every canonical URL, the sitemap, robots.txt, the Open Graph image and every
 * `@id` in the JSON-LD are built from this. It used to be the literal
 * `https://www.moment.be`, a domain the client has not bought yet — so the site
 * was telling search engines that the real version of every page was somewhere
 * that does not resolve, which is worse than saying nothing at all.
 *
 * `NEXT_PUBLIC_SITE_URL` is the supported way to set it, and the only one that
 * works in the browser bundle as well as on the server — this module is
 * imported by Client Components. The Vercel variables below are a safety net
 * for a deployment where nobody remembered: the `NEXT_PUBLIC_` one exists only
 * if "Automatically expose System Environment Variables" is on, the bare one
 * always exists on Vercel but is server-only.
 *
 * The day the domain is bought, this is one environment variable to change.
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
 * `NEXT_PUBLIC_SITE_URL` points at moment.be indexing switches itself on.
 */
export const siteIsIndexable =
  !siteConfig.url.includes("localhost") &&
  !siteConfig.url.endsWith(".vercel.app");

export type SiteLocale = (typeof siteConfig.locales)[number];

/**
 * The company facts, as the owners maintain them in the Studio.
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
  legal: {
    companyName: string;
    /** BCE enterprise number (10 digits) — required on the legal page. */
    enterpriseNumber: string;
    /** Belgian VAT number, e.g. BE0123456789 */
    vatNumber: string;
    legalForm: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
};

/**
 * What the site says about itself before anyone has filled the Studio in.
 *
 * The three geography fields are answers, not placeholders — the kitchen is in
 * Brussels whatever else changes. The rest are blank on purpose: an invented
 * phone number renders as a real one.
 */
export const DEFAULT_SITE_DETAILS: SiteDetails = {
  contact: {
    street: "",
    postalCode: "",
    city: "Brussels",
    region: "Brussels-Capital",
    country: "Belgium",
    phone: "",
    email: "",
  },
  legal: {
    companyName: "",
    enterpriseNumber: "",
    vatNumber: "",
    legalForm: "",
  },
  social: {
    instagram: "",
    facebook: "",
  },
};
