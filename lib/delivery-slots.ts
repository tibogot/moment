/**
 * The delivery hours: which two-hour window the van is expected in, and when
 * the atelier is open for collection.
 *
 * This is the other half of `lib/delivery.ts`. That module answers *which day*;
 * this one answers *when on it*. They are separate files because they are
 * separate decisions — a kitchen can change its slots without touching its
 * notice period — and because the day rules were built long before the owners
 * could tell us the hours.
 *
 * Like the rest of the delivery rules, nothing here imports Shopify or
 * `next/*`, so the preferences bar, the cart and the server actions can all
 * read it. The slots are *data*: they come from the Shopify admin and the
 * defaults below are what applies until they do.
 */

/**
 * A window the customer books, as two 24-hour `HH:MM` times.
 *
 * No id field. The window *is* the identity — a slot's whole meaning is the
 * pair of times — and inventing a separate key would mean the admin could hold
 * two entries called "slot 2" that differ, or one called "slot 2" that quietly
 * became 14:00–16:00 while carts in flight still pointed at it. See `slotId`.
 */
export type DeliverySlot = {
  start: string;
  end: string;
};

/**
 * The owners' three windows, as given on 29 August 2026.
 *
 * Ordered, and rendered in this order. They tile 09:00–15:00 with no gap and no
 * overlap, which is worth preserving if these are ever edited: two slots that
 * overlap give the customer a choice with no meaning, and a gap gives them an
 * hour the kitchen never offered but the site implies exists.
 */
export const DEFAULT_DELIVERY_SLOTS: DeliverySlot[] = [
  { start: "09:00", end: "11:00" },
  { start: "11:00", end: "13:00" },
  { start: "13:00", end: "15:00" },
];

/**
 * Collection is a window, not a slot.
 *
 * The owners take collections across one long opening — 11:00 to 16:00 — rather
 * than in booked windows, so click & collect shows this sentence instead of the
 * picker. Modelling it as a fourth "slot" would put it in the same radio group
 * as the delivery windows and imply the customer is choosing between them.
 */
export type PickupWindow = { start: string; end: string };

export const DEFAULT_PICKUP_WINDOW: PickupWindow = {
  start: "11:00",
  end: "16:00",
};

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string) {
  return TIME.test(value);
}

/** Minutes since midnight, for ordering and for comparing two windows. */
export function minutesIntoDay(time: string) {
  const match = TIME.exec(time);
  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * The stable key for a slot, used as a form value and a React key.
 *
 * Built from the times rather than stored alongside them, so it cannot drift
 * out of step with the window it names. An ASCII hyphen, deliberately: this
 * travels through URLs and form values, where the en dash the *display* form
 * uses would need escaping.
 */
export function slotId(slot: DeliverySlot) {
  return `${slot.start}-${slot.end}`;
}

export function findSlot(slots: DeliverySlot[], id: string | null | undefined) {
  if (!id) return null;
  return slots.find((slot) => slotId(slot) === id) ?? null;
}

/**
 * The cart attribute the chosen window rides on, following the same convention
 * as the date, the method and the zone: a human label, because the owners read
 * it off the order page in the Shopify admin.
 *
 * And, like the delivery method, a value that does not change with the
 * customer's language. `09:00 – 11:00` reads the same in French, Dutch and
 * English, which is the whole reason the times are stored rather than a label
 * like "Créneau 1" — the kitchen must not find "Slot 2" on one order and
 * "Tijdslot 2" on the next, and a cart started in French and reopened in Dutch
 * has to come back with the window it was given.
 */
export const DELIVERY_SLOT_ATTRIBUTE = "Delivery slot";

/** Never render this — see `formatSlot`, which is the same string today but is
 * allowed to stop being. */
export function slotAttributeValue(slot: DeliverySlot) {
  return `${slot.start} – ${slot.end}`;
}

/**
 * Back from the stored value to the slot, against the table the caller is
 * holding.
 *
 * Null for anything unrecognised, including a window the owners have since
 * removed from the admin — the same discipline `parseDeliveryMethod` and
 * `parseZoneAttribute` apply. A cart holding a slot that no longer exists must
 * read as *no slot chosen*, so the customer is asked again, rather than as a
 * booking for an hour the van is not running.
 */
export function parseSlotAttribute(
  slots: DeliverySlot[],
  value: string | null | undefined,
): DeliverySlot | null {
  const stored = value?.trim();
  if (!stored) return null;

  return slots.find((slot) => slotAttributeValue(slot) === stored) ?? null;
}

/**
 * What the customer sees: `09:00 – 11:00`.
 *
 * The same form in all three languages, on purpose. The alternatives all cost
 * more than they are worth — "9–11 h" is idiomatic French and wrong in English,
 * "9am–11am" is idiomatic English and alien in Brussels, and a per-language
 * pattern turns a two-hour window into three strings to keep in step. A
 * 24-hour range with leading zeros is what a Belgian delivery confirmation
 * looks like anyway.
 */
export function formatSlot(slot: DeliverySlot) {
  return `${slot.start} – ${slot.end}`;
}

export function formatWindow(window: PickupWindow) {
  return `${window.start} – ${window.end}`;
}

/**
 * Slots in the order they run, with anything unreadable dropped.
 *
 * Unlike the zone table, a partial answer here is safe and a total one is not:
 * a missing band silently reprices a delivery, but a missing window just means
 * the customer picks from two instead of three. Losing all of them would be a
 * cart nobody can complete, so an empty result falls back to the defaults.
 */
export function orderSlots(slots: DeliverySlot[]): DeliverySlot[] {
  const valid = slots.filter(
    (slot) => isValidTime(slot.start) && isValidTime(slot.end),
  );

  if (valid.length === 0) return DEFAULT_DELIVERY_SLOTS;

  return [...valid].sort(
    (a, b) => (minutesIntoDay(a.start) ?? 0) - (minutesIntoDay(b.start) ?? 0),
  );
}
