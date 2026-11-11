import { DELIVERY_DATE_ATTRIBUTE } from "@/lib/delivery/dates";
import { CART_COOKIE_MAX_AGE, CART_COOKIE_NAME } from "@/lib/cart-cookie";
import { hasNextDayTag } from "@/lib/delivery/next-day";
import { DELIVERY_SLOT_ATTRIBUTE } from "@/lib/delivery/slots";
import {
  DELIVERY_ZONE_ATTRIBUTE,
  parseZoneAttribute,
  type ZoneId,
} from "@/lib/delivery/zones";
import {
  DELIVERY_ADDRESS_ATTRIBUTE,
  DELIVERY_NOTE_ATTRIBUTE,
  DELIVERY_METHOD_ATTRIBUTE,
  parseDeliveryMethod,
  type DeliveryMethod,
} from "@/lib/delivery/order-preferences";
import type { Locale } from "@/lib/i18n/config";
import { formatPriceAmount } from "@/lib/i18n/format";
import { isShopifyConfigured, shopifyLanguage, storefrontRequest } from "./client";

export type CartLine = {
  id: string;
  quantity: number;
  title: string;
  productHandle: string;
  variantTitle: string;
  imageUrl: string | null;
  imageAlt: string;
  price: string;
  /** The same unit price as a number, for analytics. */
  unitPrice: number;
  /** Tagged for next-day collection in Shopify — see lib/delivery/next-day.ts. */
  nextDayPickup: boolean;
  lineTotal: string;
  variantId: string;
};

/**
 * The cart as the browser sees it.
 *
 * No `checkoutUrl`, on purpose. The way to Shopify's checkout is through
 * `beginCheckout`, which re-checks the date, window, zone and minimum against
 * live rules before handing the address over. A link rendered into the page
 * would be the same link hours later — after the cut-off, after the basket fell
 * below the minimum, after the owners closed the day.
 */
export type Cart = {
  id: string;
  totalQuantity: number;
  totalPrice: string;
  /**
   * The merchandise total as a number, for comparing against a zone's minimum
   * order. `totalPrice` is already localised into a string by the time anything
   * sees it, and parsing "€ 147,50" back out to compare it with 150 is not a
   * thing to do twice.
   *
   * Subtotal rather than total on purpose: the minimum is about what was
   * ordered, so nobody reaches a zone's minimum on the strength of the delivery
   * fee.
   */
  subtotal: number;
  lines: CartLine[];
  /** The day picked on the calendar, `YYYY-MM-DD`, or null if none yet. */
  deliveryDate: string | null;
  /**
   * The window picked on that day, as it was stored — `"09:00 – 11:00"`.
   *
   * Kept raw rather than resolved to a `DeliverySlot`, because resolving it
   * means holding the live slot table and this parser is deliberately
   * synchronous and settings-free. Whoever needs the structured window runs it
   * through `parseSlotAttribute` against the table they are already holding,
   * and gets null for a window the owners have since withdrawn — which is the
   * correct answer, and one this function could not give.
   */
  deliverySlot: string | null;
  /** Home delivery or click & collect, or null while the customer has not said. */
  deliveryMethod: DeliveryMethod | null;
  /** The canonical register address, only ever set for home delivery. */
  deliveryAddress: string | null;
  /** Free text for the driver — see DELIVERY_NOTE_ATTRIBUTE. */
  deliveryNote: string | null;
  /**
   * The zone that address fell in, resolved when it was saved rather than on
   * every read — recomputing it would mean geocoding the stored label again on
   * every cart render.
   */
  deliveryZone: ZoneId | null;
};

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  attributes: { key: string; value: string | null }[];
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string } | null;
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        cost: { totalAmount: { amount: string; currencyCode: string } };
        merchandise: {
          id: string;
          title: string;
          image: { url: string; altText: string | null } | null;
          price: { amount: string; currencyCode: string };
          product: { title: string; handle: string; tags?: string[] };
        };
      };
    }[];
  };
};

type MutationPayload = {
  cart: RawCart | null;
  userErrors: { field: string[] | null; message: string }[];
};

type CartMutationResponse = {
  data?: {
    cartCreate?: MutationPayload;
    cartLinesAdd?: MutationPayload;
    cartLinesUpdate?: MutationPayload;
    cartLinesRemove?: MutationPayload;
    cartAttributesUpdate?: MutationPayload;
  };
  errors?: { message: string }[];
};

type CartQueryResponse = {
  data?: { cart: RawCart | null };
  errors?: { message: string }[];
};

/**
 * Everything the UI needs to paint a cart. Mutations select the same set as the
 * query does, so a write hands back the new cart in one round trip — the panel
 * never has to follow a `+` with a second fetch just to learn the new quantity.
 */
const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  attributes {
    key
    value
  }
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
              tags
            }
          }
        }
      }
    }
  }
`;

const CART_RESULT_FIELDS = `
  cart { ${CART_FIELDS} }
  userErrors {
    field
    message
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!, $language: LanguageCode)
  @inContext(language: $language) {
    cartCreate(input: $input) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove(
    $cartId: ID!
    $lineIds: [ID!]!
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation CartAttributesUpdate(
    $cartId: ID!
    $attributes: [AttributeInput!]!
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      ${CART_RESULT_FIELDS}
    }
  }
`;

/**
 * Just the attributes, for the read half of the read-merge-write below. The
 * full cart query drags in every line and its image for no reason here.
 */
const CART_ATTRIBUTES_QUERY = `
  query GetCartAttributes($cartId: ID!) {
    cart(id: $cartId) {
      attributes {
        key
        value
      }
    }
  }
`;

const CART_QUERY = `
  query GetCart($cartId: ID!, $language: LanguageCode)
  @inContext(language: $language) {
    cart(id: $cartId) { ${CART_FIELDS} }
  }
`;

/**
 * The cart's own money formatter.
 *
 * Formatted in the shopper's language rather than pinned to `en-BE`, so a
 * French or Dutch shopper does not read their basket in the English convention.
 */
function formatPrice(locale: Locale, amount: string, currencyCode: string) {
  return formatPriceAmount(locale, amount, currencyCode);
}

function formatUserErrors(
  userErrors: { message: string }[] | undefined,
  fallback: string,
) {
  if (!userErrors?.length) return fallback;
  return userErrors.map((error) => error.message).join(" ");
}

function mapCartNode(locale: Locale, node: RawCart): Cart {
  const { amount, currencyCode } = node.cost.totalAmount;

  const lines = node.lines.edges
    .map(({ node: line }) => {
      const merchandise = line.merchandise;
      if (!merchandise?.product) return null;

      const lineCost = line.cost.totalAmount;

      return {
        id: line.id,
        quantity: line.quantity,
        title: merchandise.product.title,
        productHandle: merchandise.product.handle,
        variantTitle:
          merchandise.title === "Default Title" ? "" : merchandise.title,
        imageUrl: merchandise.image?.url ?? null,
        imageAlt: merchandise.image?.altText ?? merchandise.product.title,
        price: formatPrice(
          locale,
          merchandise.price.amount,
          merchandise.price.currencyCode,
        ),
        unitPrice: Number(merchandise.price.amount) || 0,
        nextDayPickup: hasNextDayTag(merchandise.product.tags ?? []),
        lineTotal: formatPrice(locale, lineCost.amount, lineCost.currencyCode),
        variantId: merchandise.id,
      } satisfies CartLine;
    })
    .filter((line): line is CartLine => line !== null);

  const attribute = (key: string) =>
    node.attributes?.find((entry) => entry.key === key)?.value ?? null;

  // `subtotalAmount` is nullable on an empty cart; falling back to the total
  // keeps the minimum-order comparison working rather than reading as €0.
  const subtotal = Number(node.cost.subtotalAmount?.amount ?? amount);

  return {
    id: node.id,
    totalQuantity: node.totalQuantity,
    totalPrice: formatPrice(locale, amount, currencyCode),
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    lines,
    deliveryDate: attribute(DELIVERY_DATE_ATTRIBUTE),
    deliverySlot: attribute(DELIVERY_SLOT_ATTRIBUTE),
    deliveryMethod: parseDeliveryMethod(attribute(DELIVERY_METHOD_ATTRIBUTE)),
    deliveryAddress: attribute(DELIVERY_ADDRESS_ATTRIBUTE),
    deliveryNote: attribute(DELIVERY_NOTE_ATTRIBUTE),
    deliveryZone: parseZoneAttribute(attribute(DELIVERY_ZONE_ATTRIBUTE)),
  };
}

export function getCartCookieOptions() {
  return {
    name: CART_COOKIE_NAME,
    maxAge: CART_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

async function runCartMutation(
  locale: Locale,
  mutation: string,
  variables: Record<string, unknown>,
  key: keyof NonNullable<CartMutationResponse["data"]>,
  fallbackError: string,
) {
  let data: NonNullable<CartMutationResponse["data"]>;
  try {
    data = await storefrontRequest<NonNullable<CartMutationResponse["data"]>>(
      mutation,
      { ...variables, language: shopifyLanguage(locale) },
    );
  } catch (error) {
    console.error(`[shopify] ${key} failed`, error);
    return { ok: false as const, error: fallbackError };
  }

  const payload = data[key];

  if (!payload?.cart) {
    console.error(`[shopify] ${key} userErrors:`, payload?.userErrors);
    return {
      ok: false as const,
      error: formatUserErrors(payload?.userErrors, fallbackError),
    };
  }

  return {
    ok: true as const,
    cartId: payload.cart.id,
    totalQuantity: payload.cart.totalQuantity,
    cart: mapCartNode(locale, payload.cart),
  };
}

/**
 * Three answers, not two, and the difference is someone's basket.
 *
 * Shopify answers `cart: null` for a cart that has expired or been checked out,
 * and that is the only case in which the cookie should be dropped and a new
 * cart started. A timeout, a throttled request or an outage says nothing about
 * the cart — and treating it as "gone" would replace a full basket with an
 * empty one on the next click.
 */
export type CartLookup =
  | { kind: "found"; cart: Cart; checkoutUrl: string }
  | { kind: "missing" }
  | { kind: "error" };

export async function lookupCart(
  locale: Locale,
  cartId: string,
): Promise<CartLookup> {
  if (!isShopifyConfigured()) return { kind: "error" };

  try {
    // Throws on any failure, caught below as "error": only an answer that
    // really says `cart: null` is allowed to cost the customer their basket.
    const data = await storefrontRequest<
      NonNullable<CartQueryResponse["data"]>
    >(CART_QUERY, { cartId, language: shopifyLanguage(locale) });

    if (!data.cart) return { kind: "missing" };

    return {
      kind: "found",
      cart: mapCartNode(locale, data.cart),
      checkoutUrl: data.cart.checkoutUrl,
    };
  } catch (error) {
    console.error("[shopify] lookupCart failed", error);
    return { kind: "error" };
  }
}

export async function addVariantToCart(
  locale: Locale,
  variantId: string,
  quantity: number,
  existingCartId?: string,
) {
  return addLinesToCart(
    locale,
    [{ merchandiseId: variantId, quantity }],
    existingCartId,
  );
}

export type CartLineInput = { merchandiseId: string; quantity: number };

/**
 * Several lines in one mutation, with the same stale-cart recovery as a single
 * add. One mutation rather than a loop because Shopify applies it atomically:
 * a reorder either lands whole or not at all, never half a basket.
 */
export async function addLinesToCart(
  locale: Locale,
  lines: CartLineInput[],
  existingCartId?: string,
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (existingCartId) {
    const added = await runCartMutation(
      locale,
      CART_LINES_ADD_MUTATION,
      {
        cartId: existingCartId,
        lines,
      },
      "cartLinesAdd",
      "Could not add this item to your cart.",
    );

    if (added.ok) return added;

    // Only a cart Shopify no longer has is replaced. Any other failure — the
    // variant sold out, a timeout — is reported, and the basket stays put.
    if ((await readCartAttributes(existingCartId)).kind !== "missing") {
      return added;
    }
  }

  return runCartMutation(
    locale,
    CART_CREATE_MUTATION,
    { input: { lines } },
    "cartCreate",
    "Could not create a cart. Check that the Storefront token has write_checkouts access.",
  );
}

type AttributeQueryResponse = {
  data?: {
    cart: { attributes: { key: string; value: string | null }[] } | null;
  };
  errors?: { message: string }[];
};

/**
 * Whatever is already on the cart. A failure here has to be distinguishable
 * from "no attributes", because merging into an empty set on a read error would
 * quietly wipe the customer's other choices — and from "no cart", because only
 * that one justifies starting a new basket. See `CartLookup`.
 */
async function readCartAttributes(
  cartId: string,
): Promise<
  | { kind: "found"; attributes: Record<string, string> }
  | { kind: "missing" }
  | { kind: "error" }
> {
  try {
    const data = await storefrontRequest<
      NonNullable<AttributeQueryResponse["data"]>
    >(CART_ATTRIBUTES_QUERY, { cartId });

    if (!data.cart) return { kind: "missing" };

    const entries = data.cart.attributes
      .filter((attribute): attribute is { key: string; value: string } =>
        Boolean(attribute.value),
      )
      .map(({ key, value }) => [key, value] as const);

    return { kind: "found", attributes: Object.fromEntries(entries) };
  } catch (error) {
    console.error("[shopify] readCartAttributes failed", error);
    return { kind: "error" };
  }
}

function toAttributeInput(attributes: Record<string, string | null>) {
  return Object.entries(attributes)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({ key, value: value as string }));
}

/**
 * Writes order preferences onto the cart. Cart attributes survive checkout, so
 * they land on the order in the Shopify admin — this is the only thing that
 * actually tells the owners what the customer chose.
 *
 * `cartAttributesUpdate` replaces the whole attribute set rather than patching
 * it, so this reads the current set and merges first. Without that, saving an
 * address would silently drop the delivery date. A `null` in the patch is how
 * you delete a key — that is how the address goes away when someone switches to
 * click & collect.
 *
 * Setting a preference is allowed before there is anything in the basket, so
 * with no cart yet this opens an empty one carrying just the attributes.
 */
export async function setCartAttributes(
  locale: Locale,
  patch: Record<string, string | null>,
  existingCartId?: string,
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (existingCartId) {
    const existing = await readCartAttributes(existingCartId);

    // Merging blindly on a failed read would wipe the other choices, and
    // starting a new cart would empty the basket. Neither is worth one saved
    // preference: say it failed, and let them click again.
    if (existing.kind === "error") {
      return { ok: false as const, error: "Could not read the cart." };
    }

    if (existing.kind === "found") {
      return runCartMutation(
        locale,
        CART_ATTRIBUTES_UPDATE_MUTATION,
        {
          cartId: existingCartId,
          attributes: toAttributeInput({ ...existing.attributes, ...patch }),
        },
        "cartAttributesUpdate",
        "Could not save your order preferences.",
      );
    }
  }

  return runCartMutation(
    locale,
    CART_CREATE_MUTATION,
    { input: { attributes: toAttributeInput(patch) } },
    "cartCreate",
    "Could not start a cart.",
  );
}

export async function removeCartLines(
  locale: Locale,
  cartId: string,
  lineIds: string[],
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  return runCartMutation(
    locale,
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    "cartLinesRemove",
    "Could not remove this item.",
  );
}

export async function updateCartLineQuantity(
  locale: Locale,
  cartId: string,
  lineId: string,
  quantity: number,
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (quantity < 1) return removeCartLines(locale, cartId, [lineId]);

  return runCartMutation(
    locale,
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    "cartLinesUpdate",
    "Could not update your cart.",
  );
}

const VARIANT_AVAILABILITY_QUERY = `
  query VariantAvailability($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
      }
    }
  }
`;

type VariantAvailabilityResponse = {
  data?: { nodes: ({ id: string; availableForSale: boolean } | null)[] };
  errors?: unknown;
};

/**
 * Which of these variants can still be bought. A deleted or unpublished one
 * comes back null, a sold-out one `availableForSale: false`; both are left
 * out, because a single unbuyable line makes Shopify refuse the whole add.
 * Throws on a failed read — the caller must not mistake an outage for an
 * empty shop.
 */
export async function availableVariantIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  const data = await storefrontRequest<
    NonNullable<VariantAvailabilityResponse["data"]>
  >(VARIANT_AVAILABILITY_QUERY, { ids });

  return new Set(
    data.nodes
      .filter((node): node is { id: string; availableForSale: boolean } =>
        Boolean(node?.availableForSale),
      )
      .map((node) => node.id),
  );
}
