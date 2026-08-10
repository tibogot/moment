import { DELIVERY_DATE_ATTRIBUTE } from "@/lib/delivery";
import {
  DELIVERY_ZONE_ATTRIBUTE,
  parseZoneAttribute,
  type ZoneId,
} from "@/lib/delivery-zones";
import {
  DELIVERY_ADDRESS_ATTRIBUTE,
  DELIVERY_METHOD_ATTRIBUTE,
  parseDeliveryMethod,
  type DeliveryMethod,
} from "@/lib/order-preferences";
import { getShopifyClient, isShopifyConfigured } from "./client";

export const CART_COOKIE_NAME = "shopify_cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export type CartLine = {
  id: string;
  quantity: number;
  title: string;
  productHandle: string;
  variantTitle: string;
  imageUrl: string | null;
  imageAlt: string;
  price: string;
  lineTotal: string;
  variantId: string;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  totalPrice: string;
  /**
   * The merchandise total as a number, for comparing against a zone's minimum
   * order. `totalPrice` is already localised into a string by the time anything
   * sees it, and parsing "€ 127,50" back out to compare it with 125 is not a
   * thing to do twice.
   *
   * Subtotal rather than total on purpose: the minimum is about what was
   * ordered, so nobody reaches €125 on the strength of the delivery fee.
   */
  subtotal: number;
  lines: CartLine[];
  /** The day picked on the calendar, `YYYY-MM-DD`, or null if none yet. */
  deliveryDate: string | null;
  /** Home delivery or click & collect, or null while the customer has not said. */
  deliveryMethod: DeliveryMethod | null;
  /** The canonical register address, only ever set for home delivery. */
  deliveryAddress: string | null;
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
          product: { title: string; handle: string };
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
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${CART_RESULT_FIELDS} }
  }
`;

const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
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
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ${CART_FIELDS} }
  }
`;

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

function formatUserErrors(
  userErrors: { message: string }[] | undefined,
  fallback: string,
) {
  if (!userErrors?.length) return fallback;
  return userErrors.map((error) => error.message).join(" ");
}

function mapCartNode(node: RawCart): Cart {
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
          merchandise.price.amount,
          merchandise.price.currencyCode,
        ),
        lineTotal: formatPrice(lineCost.amount, lineCost.currencyCode),
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
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    totalPrice: formatPrice(amount, currencyCode),
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    lines,
    deliveryDate: attribute(DELIVERY_DATE_ATTRIBUTE),
    deliveryMethod: parseDeliveryMethod(attribute(DELIVERY_METHOD_ATTRIBUTE)),
    deliveryAddress: attribute(DELIVERY_ADDRESS_ATTRIBUTE),
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
  mutation: string,
  variables: Record<string, unknown>,
  key: keyof NonNullable<CartMutationResponse["data"]>,
  fallbackError: string,
) {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(
    mutation,
    { variables },
  )) as CartMutationResponse;

  if (errors?.length) {
    console.error(`[shopify] ${key} errors:`, errors);
    return {
      ok: false as const,
      error: errors.map((error) => error.message).join(" "),
    };
  }

  const payload = data?.[key];

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
    checkoutUrl: payload.cart.checkoutUrl,
    totalQuantity: payload.cart.totalQuantity,
    cart: mapCartNode(payload.cart),
  };
}

export async function getCartById(cartId: string): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const client = getShopifyClient();
    const { data, errors } = (await client.request(CART_QUERY, {
      variables: { cartId },
    })) as CartQueryResponse;

    if (errors?.length) {
      console.error("[shopify] getCart errors:", errors);
      return null;
    }

    return data?.cart ? mapCartNode(data.cart) : null;
  } catch (error) {
    console.error("[shopify] getCartById failed", error);
    return null;
  }
}

export async function addVariantToCart(
  variantId: string,
  quantity: number,
  existingCartId?: string,
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (existingCartId) {
    const added = await runCartMutation(
      CART_LINES_ADD_MUTATION,
      { cartId: existingCartId, lines: [{ merchandiseId: variantId, quantity }] },
      "cartLinesAdd",
      "Could not add this item to your cart.",
    );

    if (added.ok) return added;
  }

  return runCartMutation(
    CART_CREATE_MUTATION,
    { input: { lines: [{ merchandiseId: variantId, quantity }] } },
    "cartCreate",
    "Could not create a cart. Check that the Storefront token has write_checkouts access.",
  );
}

type AttributeQueryResponse = {
  data?: { cart: { attributes: { key: string; value: string | null }[] } | null };
  errors?: { message: string }[];
};

/**
 * Whatever is already on the cart. A failure here has to be distinguishable
 * from "no attributes", because merging into an empty set on a read error would
 * quietly wipe the customer's other choices — hence null rather than `{}`.
 */
async function readCartAttributes(
  cartId: string,
): Promise<Record<string, string> | null> {
  try {
    const client = getShopifyClient();
    const { data, errors } = (await client.request(CART_ATTRIBUTES_QUERY, {
      variables: { cartId },
    })) as AttributeQueryResponse;

    if (errors?.length || !data?.cart) return null;

    const entries = data.cart.attributes
      .filter((attribute): attribute is { key: string; value: string } =>
        Boolean(attribute.value),
      )
      .map(({ key, value }) => [key, value] as const);

    return Object.fromEntries(entries);
  } catch (error) {
    console.error("[shopify] readCartAttributes failed", error);
    return null;
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
  patch: Record<string, string | null>,
  existingCartId?: string,
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (existingCartId) {
    const existing = await readCartAttributes(existingCartId);

    // A read failure usually means the cart id is stale, which the caller
    // recovers from by starting a fresh cart. Merging blindly would be worse.
    if (existing) {
      const updated = await runCartMutation(
        CART_ATTRIBUTES_UPDATE_MUTATION,
        {
          cartId: existingCartId,
          attributes: toAttributeInput({ ...existing, ...patch }),
        },
        "cartAttributesUpdate",
        "Could not save your order preferences.",
      );

      if (updated.ok) return updated;
    }
  }

  return runCartMutation(
    CART_CREATE_MUTATION,
    { input: { attributes: toAttributeInput(patch) } },
    "cartCreate",
    "Could not start a cart.",
  );
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  return runCartMutation(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    "cartLinesRemove",
    "Could not remove this item.",
  );
}

export async function updateCartLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (quantity < 1) return removeCartLines(cartId, [lineId]);

  return runCartMutation(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    "cartLinesUpdate",
    "Could not update your cart.",
  );
}
