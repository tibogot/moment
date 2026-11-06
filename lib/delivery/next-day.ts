/**
 * Next-day collection ("retrait la veille").
 *
 * The owners' rule: some products — cookies, three of the cakes, the healthy
 * snacks, the pantry range and the cold-pressed juices — can be ordered until
 * 15:00 the day before, for collection at the atelier the next day, with a
 * €50 minimum. Everything else keeps the standard notice.
 *
 * Which products qualify is a tag in the Shopify admin, `retrait-veille`, so
 * the owners add or remove a product without a developer. The rule applies to
 * an order only when it is collected *and every line* carries the tag: a
 * basket mixing cookies with a catering platter cannot be ready tomorrow, so
 * it follows the stricter standard rule as a whole. Delivery is never
 * next-day, whatever the products.
 *
 * Pure: no Shopify, no `next/*`, so the cart surfaces, the checkout gate and
 * the server actions all decide the same way.
 */

import type { DeliveryAvailability } from "@/lib/delivery/dates";
import type { DeliveryMethod } from "@/lib/delivery/order-preferences";

/** The Shopify product tag that marks a product as next-day collectable. */
export const NEXT_DAY_PICKUP_TAG = "retrait-veille";

export function hasNextDayTag(tags: readonly string[]) {
  return tags.some((tag) => tag.trim().toLowerCase() === NEXT_DAY_PICKUP_TAG);
}

/**
 * Whether this order qualifies: collection, and nothing in the basket outside
 * the next-day range. An empty basket does not qualify — there is nothing to
 * be ready.
 */
export function isNextDayPickup(
  method: DeliveryMethod | null,
  lines: readonly { nextDayPickup: boolean }[],
) {
  return (
    method === "pickup" &&
    lines.length > 0 &&
    lines.every((line) => line.nextDayPickup)
  );
}

/**
 * The calendar rules that apply to this order: the next-day notice and
 * cut-off when it qualifies, the standard ones otherwise. Closed days, the
 * booking window and everything else are shared.
 */
export function availabilityForOrder(
  availability: DeliveryAvailability,
  nextDay: boolean,
): DeliveryAvailability {
  if (!nextDay || !availability.nextDay) return availability;

  return {
    ...availability,
    firstBookable: availability.nextDay.firstBookable,
    leadTimeDays: availability.nextDay.leadTimeDays,
    cutoffHour: availability.nextDay.cutoffHour,
    pastCutoff: availability.nextDay.pastCutoff,
  };
}
