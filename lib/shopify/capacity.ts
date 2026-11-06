/**
 * How full each delivery window is on a given day, read from the shop's orders.
 *
 * The arithmetic and the tag format are in `lib/delivery/capacity.ts`; this is
 * the Admin API half. Two jobs:
 *
 * - `getFullSlots(date)` — which windows have reached capacity. Cached per day
 *   under `DELIVERY_CAPACITY_TAG`, which the orders webhook clears, so a window
 *   closes within seconds of its second order rather than on a timer.
 * - `tagOrderBooking(order)` — called by that webhook to copy the date and
 *   window off a new order's attributes onto its tags, which is what makes the
 *   order findable by day at all.
 *
 * Only ever read from the API route, the cart actions and the webhook — never
 * from a prerendered page, so none of this costs an ISR write.
 */

import { unstable_cache } from "next/cache";
import {
  bookingTagsFor,
  countBookings,
  bookingDateTag,
  fullSlots,
} from "@/lib/delivery/capacity";
import { parseISODate } from "@/lib/delivery/dates";
import type { DeliverySlot } from "@/lib/delivery/slots";
import { adminRequest, isAdminConfigured } from "./admin";
import { getDeliverySlots, getPickupSlots } from "./delivery";

export const DELIVERY_CAPACITY_TAG = "shopify-delivery-capacity";

/**
 * The backstop when the webhook is missing or late. Short, because the price
 * of a stale count here is an overbooked van, and cheap, because it is a data
 * cache entry per day asked about, not a page rebuild.
 */
const CAPACITY_REVALIDATE_SECONDS = 120;

/** Six drops a day at today's capacity; this is room for staff orders and growth. */
const ORDERS_PER_DAY_LIMIT = 100;

const ORDERS_BY_TAG_QUERY = `
  query OrdersForDeliveryDay($query: String!, $first: Int!) {
    orders(first: $first, query: $query) {
      nodes {
        cancelledAt
        tags
        customAttributes { key value }
      }
    }
  }
`;

type OrdersByTagResponse = {
  orders: {
    nodes: {
      cancelledAt: string | null;
      tags: string[];
      customAttributes: { key: string; value: string | null }[];
    }[];
  };
};

type BookedOrder = { tags: string[]; attributes: Record<string, string> };

/**
 * The live orders for one delivery day. Cancelled ones are dropped here rather
 * than in the search string, so a cancellation frees its window whatever
 * Shopify's search index thinks of it.
 */
const readBookedOrders = unstable_cache(
  async (dayTag: string): Promise<BookedOrder[]> => {
    const data = await adminRequest<OrdersByTagResponse>(ORDERS_BY_TAG_QUERY, {
      query: `tag:'${dayTag}'`,
      first: ORDERS_PER_DAY_LIMIT,
    });

    return data.orders.nodes
      .filter((order) => !order.cancelledAt)
      .map((order) => ({
        tags: order.tags,
        attributes: Object.fromEntries(
          order.customAttributes
            .filter((attribute) => attribute.value)
            .map((attribute) => [attribute.key, attribute.value as string]),
        ),
      }));
  },
  ["delivery-capacity"],
  { revalidate: CAPACITY_REVALIDATE_SECONDS, tags: [DELIVERY_CAPACITY_TAG] },
);

/**
 * The windows that are full on this day, as stored attribute values
 * (`09:00 – 11:00`).
 *
 * Empty when capacity is not configured, or when Shopify cannot be read. Both
 * fail open on purpose — see `lib/shopify/admin.ts` — and the failure is logged,
 * because a counter that has silently stopped counting looks exactly like a
 * quiet week.
 */
export async function getFullSlots(
  isoDate: string,
  slots?: DeliverySlot[],
  method: "delivery" | "pickup" = "delivery",
): Promise<string[]> {
  if (!isAdminConfigured() || !parseISODate(isoDate)) return [];

  try {
    const [orders, table] = await Promise.all([
      readBookedOrders(bookingDateTag(method, isoDate)),
      slots
        ? Promise.resolve(slots)
        : method === "pickup"
          ? getPickupSlots()
          : getDeliverySlots(),
    ]);
    return fullSlots(table, countBookings(table, orders));
  } catch (error) {
    console.error("[capacity] could not count orders for", isoDate, error);
    return [];
  }
}

const TAGS_ADD_MUTATION = `
  mutation TagDeliveryBooking($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors { field message }
    }
  }
`;

type TagsAddResponse = {
  tagsAdd: { userErrors: { field: string[] | null; message: string }[] } | null;
};

/**
 * Marks an order with the day and window it took, from the webhook payload.
 *
 * Idempotent: an order that already carries its tags is left alone, which is
 * what stops the `orders/updated` this very mutation triggers from looping.
 * Returns whether anything was written.
 */
export async function tagOrderBooking(order: {
  id: string;
  tags: string[];
  attributes: Record<string, string>;
}): Promise<boolean> {
  if (!isAdminConfigured()) return false;

  const [deliverySlots, pickupSlots] = await Promise.all([
    getDeliverySlots(),
    getPickupSlots(),
  ]);
  const wanted = bookingTagsFor(deliverySlots, pickupSlots, order.attributes);
  const present = new Set(order.tags.map((tag) => tag.trim().toLowerCase()));
  const missing = wanted.filter((tag) => !present.has(tag));
  if (missing.length === 0) return false;

  const data = await adminRequest<TagsAddResponse>(TAGS_ADD_MUTATION, {
    id: order.id,
    tags: missing,
  });

  const errors = data.tagsAdd?.userErrors ?? [];
  if (errors.length > 0) {
    throw new Error(`tagsAdd failed: ${JSON.stringify(errors)}`);
  }
  return true;
}
