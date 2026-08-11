/**
 * Money and dates, in the language the page is being read in.
 *
 * These existed before, spelled `en-BE` in the cart, `en-GB` in the delivery
 * date and `en-BE` again in the account — three literals for a site with one
 * language, which is exactly how a site ends up showing a French customer
 * "Monday 10 August" and "€ 1,234.56".
 *
 * Everything takes the locale as its first argument rather than reading it from
 * somewhere ambient. Server Components already have it from the route params,
 * and passing it explicitly means these stay pure and testable.
 */

import { INTL_LOCALE, type Locale } from "./config";
import { interpolate, type Dictionary } from "./dictionaries";
import { parseISODate } from "@/lib/delivery";

export function formatMoney(
  locale: Locale,
  amount: number,
  currency = "EUR",
  { cents = "auto" }: { cents?: "auto" | "always" } = {},
) {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency,
    // Round figures — a €10 delivery fee, a €100 minimum — read as though a
    // machine wrote them with the cents left on.
    minimumFractionDigits:
      cents === "always" || !Number.isInteger(amount) ? 2 : 0,
  }).format(amount);
}

/**
 * A price that arrived from Shopify as a decimal string. Kept separate from
 * `formatMoney` so the `Number()` happens in one place, and so a malformed
 * amount is visible rather than rendered as "€ NaN".
 */
export function formatPriceAmount(
  locale: Locale,
  amount: string,
  currencyCode: string,
) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "";

  return formatMoney(locale, value, currencyCode, { cents: "always" });
}

/**
 * The long form used when a delivery day is being confirmed: "lundi 10 août".
 * No year — the calendar never offers a day more than a few months out, and the
 * year is noise on a line the customer reads to check a weekday.
 */
export function formatLongDate(locale: Locale, iso: string) {
  const date = parseISODate(iso);
  if (!date) return iso;

  return date.toLocaleDateString(INTL_LOCALE[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** The short form for lists — an order history, a news index. */
export function formatShortDate(locale: Locale, value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Month name for the calendar's heading. */
export function formatMonth(locale: Locale, date: Date) {
  return date.toLocaleDateString(INTL_LOCALE[locale], { month: "long" });
}

/**
 * Monday-first weekday names for the calendar's header row.
 *
 * Generated rather than translated: every locale's weekday names already ship
 * with the platform, and a hand-written list is three more chances to misspell
 * "woensdag". 2024-01-01 was a Monday, which is where the week starts here —
 * see `monthCells` in lib/calendar.ts, whose grid assumes the same.
 */
export function weekdayNames(locale: Locale) {
  const monday = new Date(2024, 0, 1);

  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + offset);
    return day.toLocaleDateString(INTL_LOCALE[locale], { weekday: "long" });
  });
}

/**
 * The days the kitchen never delivers on, as a sentence — or `null` when it
 * delivers every day and there is nothing to say.
 *
 * This used to read "and we do not deliver on Sundays", written into the copy
 * in all three languages. Sunday is now a setting the owners change in the
 * Shopify admin, and a site that keeps announcing a rule the kitchen has
 * dropped is the same failure as a FAQ quoting last year's delivery fee.
 *
 * The article travels in the dictionary rather than being assembled here:
 * French wants it on every item ("le dimanche et le lundi"), English and Dutch
 * put a preposition in front of the whole list ("on Sunday and Monday"). That
 * is grammar, and grammar belongs with the words.
 */
export function closedWeekdaysNote(
  locale: Locale,
  // Only the section it reads, so client components can pass the trimmed
  // dictionary `useDictionary` hands them.
  dict: Pick<Dictionary, "delivery">,
  closedWeekdays: number[],
): string | null {
  if (closedWeekdays.length === 0) return null;

  const names = weekdayNames(locale);
  const days = [...new Set(closedWeekdays)]
    // `weekdayNames` runs Monday-first; `Date#getDay` counts from Sunday. This
    // is the same shift `leadingBlanks` makes for the calendar grid.
    .map((day) => (day + 6) % 7)
    .filter((index) => index >= 0 && index < 7)
    .sort((a, b) => a - b)
    .map((index) => `${dict.delivery.dayArticle}${names[index]}`);

  if (days.length === 0) return null;

  const list = new Intl.ListFormat(INTL_LOCALE[locale], {
    style: "long",
    type: "conjunction",
  }).format(days);

  return interpolate(dict.delivery.closedDays, { closedDays: list });
}
