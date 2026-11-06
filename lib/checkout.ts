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

import { isBookable, type DeliveryAvailability } from "@/lib/delivery";
import { parseSlotAttribute, type DeliverySlot } from "@/lib/delivery-slots";
import {
  minimumOrderShortfall,
  zoneById,
  type DeliveryZone,
  type ZoneId,
  type ZoneTable,
} from "@/lib/delivery-zones";
import { needsAddress, type DeliveryMethod } from "@/lib/order-preferences";

export type CheckoutBlocker =
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

export type CheckoutState = {
  deliveryDate: string | null;
  /** The stored label, as it came off the cart — see `Cart["deliverySlot"]`. */
  deliverySlot: string | null;
  deliveryMethod: DeliveryMethod | null;
  deliveryAddress: string | null;
  deliveryZone: ZoneId | null;
  subtotal: number;
};

/**
 * The first thing standing in the way, or null when nothing is.
 *
 * First rather than all of them: the cart shows one instruction at a time, and
 * the order below is the order they have to be fixed in anyway — there is no
 * point telling someone their basket is €22 short of a zone that depends on an
 * address they have not given yet.
 *
 * Click & collect skips the address, the window and the zone, and has its own
 * floor: the owners' minimum applies "qu'il s'agisse d'une livraison ou d'un
 * retrait" (3 November 2026). It pays no fee.
 */
export function checkoutBlocker(
  cart: CheckoutState,
  availability: DeliveryAvailability | null,
  zones: ZoneTable,
  slots: DeliverySlot[],
  /**
   * Windows at capacity on the cart's day, as stored attribute values — from
   * `getFullSlots` on the server, `useFullSlots` in the browser. A cart that
   * chose a window before it filled is sent back to choose again, with the same
   * message as a withdrawn one: either way, the van is not coming at that hour.
   */
  fullSlots: readonly string[] = [],
): CheckoutBlocker | null {
  if (!cart.deliveryDate) return { kind: "no-date" };

  // A null availability means the rules have not loaded yet, which must not
  // read as "every day is fine" — but it must not block a cart that is
  // otherwise ready either, so the date is taken on trust until they arrive.
  if (availability && !isBookable(cart.deliveryDate, availability)) {
    return { kind: "stale-date", date: cart.deliveryDate };
  }

  // Collection is one long opening at the atelier rather than a booked window,
  // so everything below — the window, the address, the fee and the floor — is
  // about sending a van out, and none of it applies.
  if (!needsAddress(cart.deliveryMethod)) {
    const shortfall = Math.max(0, zones.pickupMinimumOrder - cart.subtotal);
    return shortfall > 0
      ? {
          kind: "below-pickup-minimum",
          minimum: zones.pickupMinimumOrder,
          shortfall,
        }
      : null;
  }

  // The window is asked for before the address, matching the order the
  // preferences bar asks in: what time on the day is a question about the
  // order, where to is a question about the trip.
  if (!cart.deliverySlot) return { kind: "no-slot" };

  // A stored window the current table no longer holds — the owners changed
  // their rounds while this cart sat in a cookie. Not a mistake the customer
  // made, but not something the kitchen can honour either.
  if (
    !parseSlotAttribute(slots, cart.deliverySlot) ||
    fullSlots.includes(cart.deliverySlot)
  ) {
    return { kind: "stale-slot", slot: cart.deliverySlot };
  }

  if (!cart.deliveryAddress) return { kind: "no-address" };

  // An address with no zone is an address saved before the zones existed, one
  // whose attribute an owner edited by hand, or one priced against a band that
  // has since been removed from the table. Treat it as unpriced and send them
  // back through the address panel rather than guessing a minimum.
  const zone = cart.deliveryZone ? zoneById(zones, cart.deliveryZone) : null;
  if (!zone) return { kind: "no-address" };

  const shortfall = minimumOrderShortfall(cart.subtotal, zone);
  if (shortfall > 0) return { kind: "below-minimum", zone, shortfall };

  return null;
}
