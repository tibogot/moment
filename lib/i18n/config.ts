/**
 * Which languages the site speaks, and what each is called in the four places
 * that refuse to agree on how to name a language.
 *
 * The URL uses the short tag (`/fr`), because nobody wants `/fr-BE/panier` in
 * a shared link. Everything that has to be *correct* about a language — number
 * and date formatting, hreflang, Open Graph — uses the regional tag, because
 * `fr` alone formats €1,234.56 the French way rather than the Belgian way.
 * Keeping the two apart here is what stops that distinction being rediscovered
 * at each call site.
 *
 * This module imports nothing. Both the proxy (which runs before the app) and
 * client components need it.
 */

/**
 * Order matters: it is the order the switcher renders in, and the first entry
 * is the default. French leads because the kitchen, the client and most of
 * Forest do. Dutch is second rather than third because the delivery zones now
 * reach Halle, Vilvoorde and Leuven — see lib/delivery-zones.ts.
 */
export const LOCALES = ["fr", "nl", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** The tag `Intl` and `hreflang` want. */
export const INTL_LOCALE: Record<Locale, string> = {
  fr: "fr-BE",
  nl: "nl-BE",
  en: "en-BE",
};

/** Open Graph spells the same thing with an underscore. */
export const OG_LOCALE: Record<Locale, string> = {
  fr: "fr_BE",
  nl: "nl_BE",
  en: "en_BE",
};

/**
 * What each language calls itself. A switcher that says "French / Dutch /
 * English" is only useful to someone who already reads English.
 */
export const LOCALE_NAME: Record<Locale, string> = {
  fr: "Français",
  nl: "Nederlands",
  en: "English",
};

/**
 * Remembers a visitor's choice so the bare domain can send them back to it.
 * Only ever read for `/` — see proxy.ts for why it must not affect anything a
 * crawler can reach.
 */
export const LOCALE_COOKIE = "moment-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/**
 * A `lang` route param as a locale.
 *
 * Falls back rather than throwing because this is used in `generateMetadata`,
 * which runs for URLs the proxy never vetted. A page rendered in the wrong
 * language is recoverable; a metadata function that throws takes the route with
 * it. The layout is where an unknown language becomes a 404.
 */
export function toLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * The locale a path already carries, or null when it carries none.
 * `/fr/shop` -> "fr". `/shop` -> null. `/french` -> null, because the segment
 * has to be the whole segment.
 */
export function localeFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

/**
 * The same page in another language. Used by the switcher, and by the metadata
 * that has to list every translation of a route.
 *
 * A path that already names a locale has it replaced rather than prefixed,
 * which is what stops the switcher building `/nl/fr/shop` on a second click.
 */
export function withLocale(pathname: string, locale: Locale) {
  const withoutLocale = stripLocale(pathname);
  return withoutLocale === "/" ? `/${locale}` : `/${locale}${withoutLocale}`;
}

/** The route without its language, always starting with a slash. */
export function stripLocale(pathname: string) {
  const current = localeFromPath(pathname);
  if (!current) return pathname || "/";

  const rest = pathname.slice(`/${current}`.length);
  return rest.startsWith("/") ? rest : `/${rest}`;
}
