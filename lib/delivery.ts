/**
 * Delivery-day rules, shared by the calendar (client) and the server action
 * that writes the date onto the Shopify cart. Nothing here touches Shopify or
 * `next/*`, so both sides can import it.
 *
 * Dates are plain `YYYY-MM-DD` strings throughout. They compare correctly with
 * `<` / `>=`, they survive the server -> client boundary without a timezone
 * shifting them a day, and they are the format Shopify's `date` metafields and
 * metaobject fields already use.
 */

/** The kitchen's clock. "Today" is whatever day it is in Brussels. */
export const DELIVERY_TIMEZONE = "Europe/Brussels";

/** Deliveries need notice, so the first bookable day is this far out. */
export const LEAD_TIME_DAYS = 2;

/** Sunday is closed. */
export const CLOSED_WEEKDAYS = new Set([0]);

/**
 * The cart attribute the chosen day is stored under. It carries through
 * checkout and shows on the order in the Shopify admin, so the label is the
 * one the owners read on the order page — keep it human.
 */
export const DELIVERY_DATE_ATTRIBUTE = "Delivery date";

export type DeliveryAvailability = {
  /** Today in Brussels. */
  today: string;
  /** The earliest day that clears the lead time. */
  firstBookable: string;
  /** Days the owners closed in the Shopify admin. */
  closedDates: string[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function toISODate(date: Date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Local midnight on that calendar day. Never `new Date(iso)` — that parses
 * `YYYY-MM-DD` as UTC and lands on the previous day west of Greenwich.
 */
export function parseISODate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null;

  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Rejects the likes of 2026-02-31, which Date happily rolls over.
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Today in the kitchen's timezone, not the visitor's. `en-CA` formats as ISO. */
export function todayInDeliveryTimeZone(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DELIVERY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function firstBookableDate(today: string) {
  const date = parseISODate(today);
  if (!date) return today;
  return toISODate(addDays(date, LEAD_TIME_DAYS));
}

/**
 * The single definition of a blue cell. The calendar uses it to paint, and the
 * server action uses it again to decide whether to accept a submission — a
 * stale page must never be able to book a day that has since closed.
 */
export function isBookable(iso: string, availability: DeliveryAvailability) {
  const date = parseISODate(iso);
  if (!date) return false;
  if (iso < availability.firstBookable) return false;
  if (CLOSED_WEEKDAYS.has(date.getDay())) return false;
  return !availability.closedDates.includes(iso);
}

export function formatDeliveryDate(iso: string) {
  const date = parseISODate(iso);
  if (!date) return iso;

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
