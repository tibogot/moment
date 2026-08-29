/**
 * Field-level translation, as the site reads it back.
 *
 * The Studio half of this is `sanity/schemaTypes/objects/locale.ts`: one
 * document carrying three languages side by side, rather than three documents
 * that can drift apart. This is the reading half — the shape those objects
 * arrive in, and the fallback that flattens one into the language a page is
 * being rendered in.
 *
 * It sits here rather than in `lib/menus.ts`, where it was written, because
 * menus are no longer the only thing translated this way. Past events are the
 * second, and a helper both of them imported from `menus` would read as an
 * accident rather than a decision.
 */

import { DEFAULT_LOCALE, type Locale } from "../i18n/config";

/** A one-line field — a title, a caption. Only French is guaranteed. */
export type LocaleString = Partial<Record<Locale, string>>;

/** A list field — the dishes in a course, what a price includes. */
export type LocaleStringList = Partial<Record<Locale, string[]>>;

/**
 * Documents written before a field was translatable hold a bare string where
 * the object now goes. Sanity does not rewrite existing documents when a schema
 * changes, so both shapes are live until every one has been opened and re-saved
 * in the Studio.
 *
 * Only menus need this — they are the type that predates `localeString`. A
 * document type born translatable, past events included, should be typed
 * without it.
 */
export type Legacy<T> = T | string | string[];

/**
 * The value for one language, falling back to French.
 *
 * A fallback rather than a blank: a Dutch reader who meets an untranslated
 * course sees the French dish names, which on a Belgian catering menu is what
 * they would read on paper anyway. A blank section would just look broken, and
 * the gap belongs where it can be fixed — visible in the Studio, beside the
 * language that is filled in.
 */
export function pick(value: Legacy<LocaleString> | undefined, locale: Locale) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return undefined;
  return value?.[locale] ?? value?.[DEFAULT_LOCALE];
}

export function pickList(
  value: Legacy<LocaleStringList> | undefined,
  locale: Locale,
): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return [value];
  const list = value?.[locale] ?? value?.[DEFAULT_LOCALE];
  return list?.filter(Boolean) ?? [];
}
