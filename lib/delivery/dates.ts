/**
 * Delivery-day rules, shared by the calendar (client) and the server action
 * that writes the date onto the Shopify cart. Nothing here touches Shopify or
 * `next/*`, so both sides can import it.
 *
 * Dates are plain `YYYY-MM-DD` strings throughout. They compare correctly with
 * `<` / `>=`, they survive the server -> client boundary without a timezone
 * shifting them a day, and they are the format Shopify's `date` metafields and
 * metaobject fields already use.
 *
 * The rules themselves are *data*, not constants. Lead time, which weekdays the
 * kitchen opens and how far ahead it takes bookings all live in the Shopify
 * admin and arrive on `DeliveryAvailability` — the owners change them without a
 * deployment. The `DEFAULT_*` values below are what applies when nothing has
 * been configured.
 */

/** The kitchen's clock. "Today" is whatever day it is in Brussels. */
export const DELIVERY_TIMEZONE = "Europe/Brussels";

/** Deliveries need notice. Overridden from the Shopify admin. */
export const DEFAULT_LEAD_TIME_DAYS = 2;

/**
 * The hour, in Brussels, after which today stops counting towards the notice
 * period.
 *
 * The owners' rule is "minimum 48 h à l'avance avant 16 h", which is two rules
 * wearing one coat: two days of notice, *and* a daily cut-off. Without the
 * cut-off the lead time alone lets someone order at 23:50 on Monday for
 * Wednesday and call it 48 hours, when the kitchen got 34 of them.
 *
 * So an order placed at or after this hour is treated as having been placed
 * tomorrow: the lead time is unchanged, but it starts counting a day later.
 * See `effectiveLeadTimeDays`.
 */
export const DEFAULT_ORDER_CUTOFF_HOUR = 16;

/**
 * No weekday is closed by default: the owners confirmed that they work
 * Sundays "pour l'instant". When that changes it is `sunday` in the
 * `closed_weekdays` field of `delivery_settings`, not a deployment. `0` is
 * Sunday in `Date#getDay`.
 */
export const DEFAULT_CLOSED_WEEKDAYS: number[] = [];

/**
 * Next-day collection: notice in days and the cut-off hour, for orders that
 * qualify (see lib/delivery/next-day.ts). "Jusqu'à 15 h la veille."
 */
export const DEFAULT_NEXT_DAY_LEAD_TIME_DAYS = 1;
export const DEFAULT_NEXT_DAY_CUTOFF_HOUR = 15;

/**
 * How far ahead the calendar will take a booking.
 *
 * There has to be a far edge. Without one the month arrows walk forward for
 * ever and a visitor can book a delivery in 2031 — which the kitchen would
 * discover as a live order with a date nobody can plan against.
 */
export const DEFAULT_BOOKING_WINDOW_DAYS = 365;

/**
 * The cart attribute the chosen day is stored under. It carries through
 * checkout and shows on the order in the Shopify admin, so the label is the
 * one the owners read on the order page — keep it human.
 */
export const DELIVERY_DATE_ATTRIBUTE = "Delivery date";

/**
 * Everything the calendars and the server action need to decide whether a day
 * can be booked. Resolved once on the server, then handed to the client — a
 * browser in another timezone must never be the one deciding what "today" is,
 * and the rules must be the same on both sides of the boundary.
 *
 * Plain arrays rather than `Set`s on purpose: this object crosses into a Client
 * Component and has to serialise.
 */
export type DeliveryAvailability = {
  /** Today in Brussels. */
  today: string;
  /** The earliest day that clears the lead time. */
  firstBookable: string;
  /** The far edge of the booking window. */
  lastBookable: string;
  /**
   * Notice required, in days. Shown to the customer as well as applied.
   *
   * Deliberately the *nominal* figure — "we need two days" — not the effective
   * one. When an order is placed after the cut-off the earliest bookable day
   * moves out by one, and `firstBookable` already reflects that; saying "we
   * need three days' notice" at 16:01 and "two" at 15:59 would make the site
   * look like it was making the rule up.
   */
  leadTimeDays: number;
  /** The hour, in Brussels, after which today stops counting. 24-hour clock. */
  cutoffHour: number;
  /**
   * Whether the visitor is reading this *after* today's cut-off — in which case
   * `firstBookable` is already a day further out than the lead time alone would
   * put it, and the copy can explain why rather than leaving them to notice.
   */
  pastCutoff: boolean;
  /** Weekdays the kitchen never delivers on, `0` = Sunday. */
  closedWeekdays: number[];
  /** Individual days the owners closed in the Shopify admin. */
  closedDates: string[];
  /**
   * The closures could not be read, so `closedDates` is empty for want of an
   * answer rather than because nothing is closed.
   *
   * The calendars still paint from it — a page cached through a Shopify blip
   * should not show a month of closed days until the next revalidation — but
   * the server refuses to book or check out against it. The customer is asked
   * to try again in a moment; the alternative is selling a day the owners took
   * off.
   */
  closuresUnavailable: boolean;
  /**
   * The same day arithmetic for next-day collection, which has its own notice
   * and cut-off. Applied through `availabilityForOrder` only to orders that
   * qualify; absent on objects built before the rule existed.
   */
  nextDay?: {
    firstBookable: string;
    leadTimeDays: number;
    cutoffHour: number;
    pastCutoff: boolean;
  };
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

/**
 * The hour of the day in Brussels, 0–23.
 *
 * `hourCycle: "h23"` rather than `hour12: false`, which some ICU builds render
 * as "24" at midnight — a number that would quietly put every midnight order
 * past a 16:00 cut-off.
 */
export function hourInDeliveryTimeZone(now = new Date()) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: DELIVERY_TIMEZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now);

  return Number(hour);
}

/**
 * The cut-off as a clock time — `16` becomes `16:00`.
 *
 * The same 24-hour form the delivery windows use, and for the same reason: it
 * reads identically in French, Dutch and English, so a rule the customer is
 * being held to does not change shape with the language they read it in.
 */
export function formatCutoffHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function isPastOrderCutoff(
  cutoffHour = DEFAULT_ORDER_CUTOFF_HOUR,
  now = new Date(),
) {
  return hourInDeliveryTimeZone(now) >= cutoffHour;
}

/**
 * The lead time as it actually applies right now: the nominal notice period,
 * plus a day if today's cut-off has already gone.
 *
 * Kept separate from `leadTimeDays` so the two audiences get the right number —
 * the calendar needs the effective one to decide what to grey out, the copy
 * needs the nominal one to state the rule. Conflating them is how a FAQ ends up
 * announcing a different notice period depending on the time of day.
 */
export function effectiveLeadTimeDays(
  leadTimeDays = DEFAULT_LEAD_TIME_DAYS,
  cutoffHour = DEFAULT_ORDER_CUTOFF_HOUR,
  now = new Date(),
) {
  return isPastOrderCutoff(cutoffHour, now) ? leadTimeDays + 1 : leadTimeDays;
}

/** `today` shifted by `days`, or `today` unchanged if it will not parse. */
export function shiftISODate(today: string, days: number) {
  const date = parseISODate(today);
  if (!date) return today;
  return toISODate(addDays(date, days));
}

export function firstBookableDate(
  today: string,
  leadTimeDays = DEFAULT_LEAD_TIME_DAYS,
) {
  return shiftISODate(today, leadTimeDays);
}

export function lastBookableDate(
  today: string,
  windowDays = DEFAULT_BOOKING_WINDOW_DAYS,
) {
  return shiftISODate(today, windowDays);
}

/**
 * Every day from `start` to `end` inclusive, clipped to `[from, to]`.
 *
 * This is what makes a closure a *period* rather than a date. Three weeks shut
 * in August is one entry in the Shopify admin, not twenty-one — and an owner
 * who has to make twenty-one entries makes none, then rings to ask why the site
 * took an order while the atelier was empty.
 *
 * Clipping is not tidiness: an open-ended range would otherwise expand to
 * however many days it spans, all of them outside the window the calendar can
 * even show.
 */
export function expandClosureRange(
  start: string,
  end: string,
  bounds: { from: string; to: string },
): string[] {
  const first = start < bounds.from ? bounds.from : start;
  const last = end > bounds.to ? bounds.to : end;
  if (first > last) return [];

  const cursor = parseISODate(first);
  if (!cursor || !parseISODate(last)) return [];

  const days: string[] = [];
  for (let iso = first; iso <= last; iso = toISODate(cursor)) {
    days.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/**
 * Why a day looks the way it does.
 *
 * `past`, `beyond` and `closed` are all unbookable, but they mean different
 * things to a visitor: the first two are days the calendar does not offer — one
 * already gone or inside the lead time, one further out than the kitchen plans
 * — while `closed` is a day it actively turned down. Painting them identically
 * made the first half of every month read as "fully booked", so the calendars
 * branch on this and only `closed` gets the solid fill.
 */
export type DayState = "past" | "beyond" | "closed" | "open";

export function dayState(
  iso: string,
  availability: DeliveryAvailability,
): DayState {
  const date = parseISODate(iso);
  if (!date) return "closed";

  // Checked first: a Sunday that has already gone is past, not "closed today".
  if (iso < availability.firstBookable) return "past";
  if (iso > availability.lastBookable) return "beyond";
  if (availability.closedWeekdays.includes(date.getDay())) return "closed";
  return availability.closedDates.includes(iso) ? "closed" : "open";
}

/**
 * The single definition of a bookable day. The calendars use it to paint, and
 * the server action uses it again to decide whether to accept a submission — a
 * stale page must never be able to book a day that has since closed.
 */
export function isBookable(iso: string, availability: DeliveryAvailability) {
  return dayState(iso, availability) === "open";
}
