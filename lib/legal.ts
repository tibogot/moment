/**
 * The facts the legal pages quote that are not the company's own — the
 * registry, the host, the regulators, the processors — kept in one place so
 * the five pages and three languages cannot disagree about them.
 *
 * Checked on 5 November 2026. Anything marked "confirm" is our best reading
 * and wants the owners' or their accountant's eye before launch.
 */

/**
 * The register of legal persons and the court that keeps it. A company with
 * its seat in Forest is registered with the enterprise court of Brussels; which
 * of the two Brussels courts (French- or Dutch-speaking) follows the language
 * of the articles of association — French is assumed, confirm against the
 * statutes.
 */
export const COMPANY_REGISTRY = {
  fr: "RPM Bruxelles, division francophone",
  nl: "RPR Brussel, Franstalige afdeling",
  en: "RLE Brussels, French-speaking division",
} as const;

/** Who serves the site. Not required by Belgian law, but cheap to say. */
export const HOSTING_PROVIDER = {
  name: "Vercel Inc.",
  address: "440 N Barranca Ave #4133, Covina, CA 91723, United States",
  url: "https://vercel.com",
} as const;

export const DATA_PROTECTION_AUTHORITY = {
  name: {
    fr: "Autorité de protection des données (APD)",
    nl: "Gegevensbeschermingsautoriteit (GBA)",
    en: "Data Protection Authority (APD/GBA)",
  },
  address: {
    fr: "Rue de la Presse 35, 1000 Bruxelles",
    nl: "Drukpersstraat 35, 1000 Brussel",
    en: "Rue de la Presse 35, 1000 Brussels",
  },
  email: "contact@apd-gba.be",
  url: {
    fr: "https://www.autoriteprotectiondonnees.be",
    nl: "https://www.gegevensbeschermingsautoriteit.be",
    en: "https://www.dataprotectionauthority.be",
  },
} as const;

export const CONSUMER_MEDIATION = {
  name: {
    fr: "Service de Médiation pour le Consommateur",
    nl: "Consumentenombudsdienst",
    en: "Consumer Mediation Service",
  },
  address: {
    fr: "Boulevard du Roi Albert II 8, boîte 1, 1000 Bruxelles",
    nl: "Koning Albert II-laan 8, bus 1, 1000 Brussel",
    en: "Boulevard du Roi Albert II 8, box 1, 1000 Brussels",
  },
  url: {
    fr: "https://mediationconsommateur.be",
    nl: "https://consumentenombudsdienst.be",
    en: "https://consumerombudsman.be",
  },
} as const;

/** Shopify's own cookie policy, for the cookies its checkout sets. */
export const SHOPIFY_COOKIE_POLICY = "https://www.shopify.com/legal/cookies";

/**
 * The date the legal pages were last rewritten. Shown at the foot of each so a
 * reader — or a court — can tell which version they agreed to.
 */
export const LEGAL_LAST_UPDATED = "2026-11-05";

/**
 * "Label : value" in French, "Label: value" in Dutch and English. French puts
 * a (non-breaking) space before the colon; the other two do not.
 */
export function colon(locale: "fr" | "nl" | "en") {
  return locale === "fr" ? " : " : ": ";
}
