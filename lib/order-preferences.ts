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

export type DeliveryMethodOption = {
  id: DeliveryMethod;
  label: string;
  description: string;
};

export const DELIVERY_METHODS: DeliveryMethodOption[] = [
  {
    id: "delivery",
    label: "Home delivery",
    description: "We bring your order to your door, anywhere in Brussels.",
  },
  {
    id: "pickup",
    label: "Click & collect",
    description: "Collect it from the kitchen yourself. No address needed.",
  },
];

const METHOD_BY_ID = new Map(DELIVERY_METHODS.map((option) => [option.id, option]));
const METHOD_BY_LABEL = new Map(
  DELIVERY_METHODS.map((option) => [option.label, option.id]),
);

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return typeof value === "string" && METHOD_BY_ID.has(value as DeliveryMethod);
}

export function deliveryMethodLabel(method: DeliveryMethod) {
  return METHOD_BY_ID.get(method)?.label ?? method;
}

/**
 * Back from the stored label to the id. Returns null for anything unrecognised
 * — including a label an owner edited by hand in the admin, which must not
 * resolve to a half-valid method.
 */
export function parseDeliveryMethod(
  value: string | null | undefined,
): DeliveryMethod | null {
  if (!value) return null;
  return METHOD_BY_LABEL.get(value) ?? null;
}

/**
 * Click & collect has nowhere to deliver to. An unset method still counts as
 * needing one, because home delivery is the assumption until told otherwise.
 */
export function needsAddress(method: DeliveryMethod | null) {
  return method !== "pickup";
}
