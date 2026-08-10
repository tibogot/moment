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
  /** Home delivery with nowhere to deliver to. */
  | { kind: "no-address" }
  /** The basket is short of the zone's minimum order. */
  | { kind: "below-minimum"; zone: DeliveryZone; shortfall: number };

export type CheckoutState = {
  deliveryDate: string | null;
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
 * Click & collect skips the address and the minimum on purpose. The client's
 * table is headed "Livraison payante": the fee and the floor are what it costs
 * to send a van out, and collecting from the atelier sends nothing.
 */
export function checkoutBlocker(
  cart: CheckoutState,
  availability: DeliveryAvailability | null,
  zones: ZoneTable,
): CheckoutBlocker | null {
  if (!cart.deliveryDate) return { kind: "no-date" };

  // A null availability means the rules have not loaded yet, which must not
  // read as "every day is fine" — but it must not block a cart that is
  // otherwise ready either, so the date is taken on trust until they arrive.
  if (availability && !isBookable(cart.deliveryDate, availability)) {
    return { kind: "stale-date", date: cart.deliveryDate };
  }

  if (!needsAddress(cart.deliveryMethod)) return null;

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
