export const siteConfig = {
  name: "Moment",
  url: "https://www.moment.be",
  defaultLocale: "en",
  /** English first; nl/fr get added once the copy is translated. */
  locales: ["en", "fr", "nl"] as const,
  description:
    "Traiteur in Brussels — catering for private hosts and companies, event service, and a coffee desk.",
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
    companyName: "Moment",
    /** BCE enterprise number (10 digits) — required on the legal page. */
    enterpriseNumber: "",
    /** Belgian VAT number, e.g. BE0123456789 */
    vatNumber: "",
    legalForm: "",
  },
  social: {
    instagram: "",
    facebook: "",
  },
} as const;

export type SiteLocale = (typeof siteConfig.locales)[number];
