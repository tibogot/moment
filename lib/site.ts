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
export const siteConfig = {
  name: "Moment",
  url: "https://www.moment.be",
  defaultLocale: DEFAULT_LOCALE,
  locales: LOCALES,
  description:
    "Traiteur in Brussels — catering for private hosts and companies, event service, and a coffee desk.",
} as const;

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
