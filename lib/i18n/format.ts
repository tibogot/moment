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
