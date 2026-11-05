/**
 * How many orders a delivery window can take, and how an order is marked as
 * having taken one.
 *
 * The owners' answer of 3 November 2026: two deliveries per window, three
 * windows, six a day. A window with two orders on it stops being offered.
 *
 * Like the rest of the delivery rules this imports nothing from Shopify or
 * `next/*`. The counting itself lives in `lib/shopify/capacity.ts`; this file is
 * only the arithmetic and the naming, so the webhook that writes the marks and
 * the query that reads them cannot disagree about what a mark looks like.
 *
 * **Why tags.** The Admin API can search orders by tag but not by cart
 * attribute, and the date and window ride on attributes. So when an order is
 * created, the webhook copies them onto it as two tags:
 *
 *   `livraison-2026-11-07`   the day — what the count is searched by
 *   `creneau-0900`           the window, by its start time
 *
 * The side effect is deliberate and useful: the owners can filter their orders
 * by day in the Shopify admin, and **a phone order takes a window the moment
 * someone adds those two tags to it by hand.** That is the whole manual
 * override — no field to learn, and it is the same mark the site writes.
 */

import { DELIVERY_DATE_ATTRIBUTE, parseISODate } from "@/lib/delivery";
import {
  DELIVERY_SLOT_ATTRIBUTE,
  parseSlotAttribute,
  slotAttributeValue,
  slotId,
  type DeliverySlot,
} from "@/lib/delivery-slots";
import {
  DELIVERY_METHOD_ATTRIBUTE,
  parseDeliveryMethod,
} from "@/lib/order-preferences";

/** Two vans' worth of drops per window, until the admin says otherwise. */
export const DEFAULT_SLOT_CAPACITY = 2;

/** What a window holds: its own figure from the admin, or the default. */
export function slotCapacity(slot: DeliverySlot) {
  return slot.capacity ?? DEFAULT_SLOT_CAPACITY;
}

const DATE_TAG_PREFIX = "livraison-";
const SLOT_TAG_PREFIX = "creneau-";

/** `livraison-2026-11-07`. Searched with `tag:` in the Admin API. */
export function deliveryDateTag(isoDate: string) {
  return `${DATE_TAG_PREFIX}${isoDate}`;
}

/** `creneau-0900`, from the window's start. Unique because windows do not overlap. */
export function deliverySlotTag(slot: DeliverySlot) {
  return `${SLOT_TAG_PREFIX}${slot.start.replace(":", "")}`;
}

/**
 * The window an order holds, read back from what came out of the Admin API.
 *
 * The attribute first, because that is what the site wrote and it names the
 * window exactly. The tag second, because a phone order typed in by hand has
 * no attributes at all — only the tags someone added. Null for a window the
 * current table no longer has: an order for a withdrawn window cannot fill a
 * window that exists.
 */
export function bookedSlot(
  slots: DeliverySlot[],
  order: { tags: string[]; attributes: Record<string, string> },
): DeliverySlot | null {
  const fromAttribute = parseSlotAttribute(
    slots,
    order.attributes[DELIVERY_SLOT_ATTRIBUTE],
  );
  if (fromAttribute) return fromAttribute;

  const tags = new Set(order.tags.map((tag) => tag.trim().toLowerCase()));
  return slots.find((slot) => tags.has(deliverySlotTag(slot))) ?? null;
}

/**
 * Bookings per window, keyed by the stored attribute value (`09:00 – 11:00`) —
 * the same key `checkoutBlocker` holds, so a full window is a lookup, not a
 * second parse.
 */
export type SlotBookings = Record<string, number>;

export function countBookings(
  slots: DeliverySlot[],
  orders: { tags: string[]; attributes: Record<string, string> }[],
): SlotBookings {
  const counts: SlotBookings = {};

  for (const order of orders) {
    const slot = bookedSlot(slots, order);
    if (!slot) continue;

    const key = slotAttributeValue(slot);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

/** The windows that have reached their capacity, as stored attribute values. */
export function fullSlots(
  slots: DeliverySlot[],
  bookings: SlotBookings,
): string[] {
  return slots
    .filter((slot) => (bookings[slotAttributeValue(slot)] ?? 0) >= slotCapacity(slot))
    .map(slotAttributeValue);
}

/** From the slot ids the pickers hold to the attribute values the gate holds. */
export function slotValuesForIds(slots: DeliverySlot[], ids: readonly string[]) {
  return slots.filter((slot) => ids.includes(slotId(slot))).map(slotAttributeValue);
}

/**
 * The tags a new order should carry, or an empty list when it takes no window:
 * a collection, an order with no date, or one whose window the table does not
 * recognise. Collections are counted separately once their slots exist — they
 * are not drops, and must not use up the van.
 */
export function bookingTagsFor(
  slots: DeliverySlot[],
  attributes: Record<string, string>,
): string[] {
  if (parseDeliveryMethod(attributes[DELIVERY_METHOD_ATTRIBUTE]) === "pickup") {
    return [];
  }

  const date = attributes[DELIVERY_DATE_ATTRIBUTE]?.trim();
  if (!date || !parseISODate(date)) return [];

  const slot = parseSlotAttribute(slots, attributes[DELIVERY_SLOT_ATTRIBUTE]);
  if (!slot) return [];

  return [deliveryDateTag(date), deliverySlotTag(slot)];
}
