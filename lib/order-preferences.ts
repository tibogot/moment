/**
 * The two order preferences that sit either side of the delivery date: how the
 * order leaves the kitchen, and where it goes.
 *
 * Like `lib/delivery.ts` this imports nothing from Shopify or `next/*`, so the
 * client bar and the server actions can both read it.
 *
 * Both ride on the cart as attributes, so they follow the order into the
 * Shopify admin. The stored value is the human label for the same reason the
 * delivery date's is — these are read off the order page by the owners, not by
 * a machine.
 */

export const DELIVERY_METHOD_ATTRIBUTE = "Delivery method";
export const DELIVERY_ADDRESS_ATTRIBUTE = "Delivery address";

/**
 * Below this the address register's fuzzy matcher just returns noise. It lives
 * here rather than next to the lookup itself so the client can read it without
 * pulling the server-side module into the browser bundle.
 */
export const MIN_ADDRESS_QUERY_LENGTH = 3;

export type DeliveryMethod = "delivery" | "pickup";

/** Render order for the picker. What each is *called* lives in the dictionaries. */
export const DELIVERY_METHODS: readonly DeliveryMethod[] = [
  "delivery",
  "pickup",
];

/**
 * What actually gets written onto the cart — and deliberately not the same
 * string the customer sees.
 *
 * These two were one value until the site went trilingual, and they could not
 * stay that way. The attribute follows the order into the Shopify admin, so if
 * it were the display label the kitchen would find "Click & collect" on one
 * order and "Afhalen" on the next depending on which language the customer
 * happened to be reading. Worse, `parseDeliveryMethod` matches on it, so a cart
 * started in French and reopened in Dutch would come back with no method at
 * all.
 *
 * So: one canonical value per method, stable across languages and never shown
 * to anyone. Changing a string here is a data migration — every cart in flight
 * (the cookie lasts a fortnight) stops resolving.
 */
const METHOD_ATTRIBUTE_VALUE: Record<DeliveryMethod, string> = {
  delivery: "Home delivery",
  pickup: "Click & collect",
};

const METHOD_BY_ATTRIBUTE_VALUE = new Map(
  (Object.entries(METHOD_ATTRIBUTE_VALUE) as [DeliveryMethod, string][]).map(
    ([method, value]) => [value, method],
  ),
);

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return value === "delivery" || value === "pickup";
}

/** The canonical value for the cart attribute. Never render this. */
export function deliveryMethodAttributeValue(method: DeliveryMethod) {
  return METHOD_ATTRIBUTE_VALUE[method];
}

/**
 * Back from the stored value to the id. Returns null for anything
 * unrecognised — including a value an owner edited by hand in the admin, which
 * must not resolve to a half-valid method.
 */
export function parseDeliveryMethod(
  value: string | null | undefined,
): DeliveryMethod | null {
  if (!value) return null;
  return METHOD_BY_ATTRIBUTE_VALUE.get(value) ?? null;
}

/**
 * Click & collect has nowhere to deliver to. An unset method still counts as
 * needing one, because home delivery is the assumption until told otherwise.
 */
export function needsAddress(method: DeliveryMethod | null) {
  return method !== "pickup";
}
