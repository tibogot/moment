/**
 * The one answer to "can this cart go to checkout yet, and if not, why not".
 *
 * It lives on its own because there are two checkout buttons — the cart page
 * and the slide-out panel — and a rule enforced in one of them is not a rule.
 * The date gate was already written twice; the minimum order would have made
 * four copies of two conditions.
 *
 * Only the reason comes back, never the wording. What the customer is told
 * belongs to the component, which is where it can be translated.
 */

import { isBookable, type DeliveryAvailability } from "@/lib/delivery/dates";
import {
  availabilityForOrder,
  isNextDayPickup,
} from "@/lib/delivery/next-day";
import {
  DEFAULT_PICKUP_SLOTS,
  parseSlotAttribute,
  slotsForMethod,
  type DeliverySlot,
} from "@/lib/delivery/slots";
import {
  minimumOrderShortfall,
  zoneById,
  type DeliveryZone,
  type ZoneId,
  type ZoneTable,
} from "@/lib/delivery/zones";
import { needsAddress, type DeliveryMethod } from "@/lib/delivery/order-preferences";

export type CheckoutBlocker =
  /** Products ordered in fewer pieces than the per-product minimum. */
  | {
      kind: "below-piece-minimum";
      minimum: number;
      lines: { title: string; quantity: number }[];
    }
  /** No delivery day chosen yet. */
  | { kind: "no-date" }
  /** A day was chosen and has since closed, or fallen inside the lead time. */
  | { kind: "stale-date"; date: string }
  /** Home delivery with no two-hour window chosen. */
  | { kind: "no-slot" }
  /** A window was chosen and the owners have since withdrawn it. */
  | { kind: "stale-slot"; slot: string }
  /** Home delivery with nowhere to deliver to. */
  | { kind: "no-address" }
  /** The basket is short of the zone's minimum order. */
  | { kind: "below-minimum"; zone: DeliveryZone; shortfall: number }
  /** Click & collect below the collection minimum. */
  | { kind: "below-pickup-minimum"; minimum: number; shortfall: number };

/**
 * The rules this cart is held to: next-day collection or the standard ones.
 * Exported so the calendars and the checkout gate cannot disagree about which
 * days, and which minimum, apply.
 */
export function orderRules(
  cart: Pick<CheckoutState, "deliveryMethod" | "lines">,
  availability: DeliveryAvailability,
  zones: ZoneTable,
) {
  const nextDay = isNextDayPickup(cart.deliveryMethod, cart.lines);
  return {
    nextDay,
    availability: availabilityForOrder(availability, nextDay),
    pickupMinimumOrder: nextDay
      ? zones.nextDayPickupMinimumOrder
      : zones.pickupMinimumOrder,
  };
}

export type CheckoutState = {
  deliveryDate: string | null;
  /** The stored label, as it came off the cart — see `Cart["deliverySlot"]`. */
  deliverySlot: string | null;
  deliveryMethod: DeliveryMethod | null;
  deliveryAddress: string | null;
  deliveryZone: ZoneId | null;
  subtotal: number;
  /**
   * What is in the basket — for the per-product piece minimum, and whether it
   * qualifies for next-day collection.
   */
  lines: readonly { title: string; quantity: number; nextDayPickup: boolean }[];
};

/**
 * The first thing standing in the way, or null when nothing is.
 *
 * First rather than all of them: the cart shows one instruction at a time, and
 * the order below is the order they have to be fixed in anyway — there is no
 * point telling someone their basket is €22 short of a zone that depends on an
 * address they have not given yet.
 *
 * Click & collect books a collection time instead of a delivery window, skips
 * the address and the zone, and has its own floor — €100, or €50 for a
 * next-day collection. It pays no fee.
 */
export function checkoutBlocker(
  cart: CheckoutState,
  availability: DeliveryAvailability | null,
  zones: ZoneTable,
  slots: DeliverySlot[],
  /**
   * Slots at capacity on the cart's day, for the cart's method, as stored
   * attribute values — from `getFullSlots` on the server, `useFullSlots` in
   * the browser. A cart that chose a slot before it filled is sent back to
   * choose again, with the same message as a withdrawn one.
   */
  fullSlots: readonly string[] = [],
  pickupSlots: DeliverySlot[] = DEFAULT_PICKUP_SLOTS,
): CheckoutBlocker | null {
  // The basket itself comes first: whatever the day or the address, a product
  // in fewer than the minimum pieces cannot be prepared, and fixing it changes
  // the subtotal every rule below is measured against.
  const short = cart.lines.filter(
    (line) => line.quantity < zones.minimumPiecesPerProduct,
  );
  if (short.length > 0) {
    return {
      kind: "below-piece-minimum",
      minimum: zones.minimumPiecesPerProduct,
      lines: short.map(({ title, quantity }) => ({ title, quantity })),
    };
  }

  if (!cart.deliveryDate) return { kind: "no-date" };

  // Next-day collection moves the earliest day and the cut-off, so the day is
  // checked against the rules for this very basket. A null availability means
  // the rules have not loaded yet: not "every day is fine", but not a reason
  // to block an otherwise ready cart either.
  const rules = availability ? orderRules(cart, availability, zones) : null;
  if (rules && !isBookable(cart.deliveryDate, rules.availability)) {
    return { kind: "stale-date", date: cart.deliveryDate };
  }

  // Delivery windows or collection times, asked for before the address: what
  // time on the day is a question about the order, where to is a question
  // about the trip.
  if (!cart.deliverySlot) return { kind: "no-slot" };

  // A stored slot the current table no longer holds, or one that has filled
  // since it was chosen. Not a mistake the customer made, but not something the
  // kitchen can honour either.
  const slotTable = slotsForMethod(cart.deliveryMethod, slots, pickupSlots);
  if (
    !parseSlotAttribute(slotTable, cart.deliverySlot) ||
    fullSlots.includes(cart.deliverySlot)
  ) {
    return { kind: "stale-slot", slot: cart.deliverySlot };
  }

  // Collection: no address, no zone, no fee — only its own floor.
  if (!needsAddress(cart.deliveryMethod)) {
    const minimum =
      rules?.pickupMinimumOrder ??
      (isNextDayPickup(cart.deliveryMethod, cart.lines)
        ? zones.nextDayPickupMinimumOrder
        : zones.pickupMinimumOrder);
    const shortfall = Math.max(0, minimum - cart.subtotal);
    return shortfall > 0
      ? { kind: "below-pickup-minimum", minimum, shortfall }
      : null;
  }

  if (!cart.deliveryAddress) return { kind: "no-address" };

  // An address with no zone is one whose attribute an owner edited by hand,
  // or one priced against a band that
  // has since been removed from the table. Treat it as unpriced and send them
  // back through the address panel rather than guessing a minimum.
  const zone = cart.deliveryZone ? zoneById(zones, cart.deliveryZone) : null;
  if (!zone) return { kind: "no-address" };

  const shortfall = minimumOrderShortfall(cart.subtotal, zone);
  if (shortfall > 0) return { kind: "below-minimum", zone, shortfall };

  return null;
}
