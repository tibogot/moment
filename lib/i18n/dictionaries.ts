/**
 * Loading the right dictionary, and surviving the months in which it is
 * incomplete.
 *
 * The dictionaries are imported dynamically so only the requested language is
 * bundled, and because they are read in Server Components none of the other two
 * ever reach the browser.
 *
 * `fr` is the reference. Its shape is the type, so a key added to French and
 * forgotten in Dutch is a compile error at the point the Dutch file is read
 * rather than an `undefined` rendered into a page.
 */

import frDictionary from "./dictionaries/fr.json";
import { DEFAULT_LOCALE, type Locale } from "./config";

export type Dictionary = typeof frDictionary;

/**
 * Nested so translations can be grouped by where they are used, which is the
 * only grouping that survives someone reorganising the components.
 */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const loaders: Record<Locale, () => Promise<DeepPartial<Dictionary>>> = {
  fr: async () => frDictionary,
  nl: () => import("./dictionaries/nl.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

/**
 * French fills any gap.
 *
 * The alternative — shipping the key name, or an empty string — turns a missing
 * translation into a visibly broken page. A French line on a Dutch page is
 * merely untranslated, which is the honest description of what it is, and it
 * stays legible to a Belgian reader while the copy is being written.
 *
 * This is why the whole site can go multilingual before all of it is
 * translated: each string starts falling back and stops the day someone writes
 * it.
 */
function withFallback<T>(source: T, fallback: T): T {
  if (!isPlainObject(source) || !isPlainObject(fallback)) {
    return source === undefined ? fallback : source;
  }

  const merged: Record<string, unknown> = { ...fallback };

  for (const [key, value] of Object.entries(source)) {
    merged[key] = withFallback(value, (fallback as Record<string, unknown>)[key]);
  }

  return merged as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === DEFAULT_LOCALE) return frDictionary;

  const dictionary = await loaders[locale]();
  return withFallback(dictionary as Dictionary, frDictionary);
}

/**
 * The sections a Client Component can ask for through `useDictionary`.
 *
 * Anything handed to a client component is serialised into the RSC payload
 * that ships inside every page's HTML, and the whole dictionary went through
 * `LocaleProvider` — so the home page carried the FAQ answers, the cookie
 * policy, the sign-in copy and all of `meta`, ~28 KB of JSON to parse before
 * hydration could finish. `meta` is the clearest case: it exists for
 * `generateMetadata`, which runs on the server and never renders.
 *
 * The rest stay server-side, where Server Components read them from
 * `getDictionary` directly and they cost nothing on the client. Add a key here
 * only when a component that says "use client" genuinely reads it — TypeScript
 * will tell you, because `useDictionary` returns this type and not `Dictionary`.
 */
const CLIENT_SECTIONS = [
  "aboutNav",
  "cart",
  "common",
  "contact",
  "cookies",
  "delivery",
  "deliveryMethods",
  "errors",
  "footer",
  "home",
  "language",
  "legalNav",
  "nav",
  "news",
  "orderBar",
  "proAccount",
  "product",
  "quote",
  "search",
  "shop",
] as const satisfies readonly (keyof Dictionary)[];

export type ClientDictionary = Pick<
  Dictionary,
  (typeof CLIENT_SECTIONS)[number]
>;

export function clientDictionary(dictionary: Dictionary): ClientDictionary {
  const picked = {} as Record<string, unknown>;
  for (const section of CLIENT_SECTIONS) picked[section] = dictionary[section];
  return picked as ClientDictionary;
}

/**
 * Fills `{name}` placeholders. Deliberately not a full ICU implementation —
 * the moment this needs plurals or gendered agreement, reach for `next-intl`
 * rather than growing this into a worse version of it.
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
