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
  lines: CartLine[];
};

type CartResult = { id: string; checkoutUrl: string; totalQuantity: number };

type MutationPayload = {
  cart: CartResult | null;
  userErrors: { field: string[] | null; message: string }[];
};

type CartMutationResponse = {
  data?: {
    cartCreate?: MutationPayload;
    cartLinesAdd?: MutationPayload;
    cartLinesUpdate?: MutationPayload;
    cartLinesRemove?: MutationPayload;
  };
  errors?: { message: string }[];
};

type CartQueryResponse = {
  data?: {
    cart: {
      id: string;
      checkoutUrl: string;
      totalQuantity: number;
      cost: { totalAmount: { amount: string; currencyCode: string } };
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
    } | null;
  };
  errors?: { message: string }[];
};

const CART_RESULT_FIELDS = `
  cart {
    id
    checkoutUrl
    totalQuantity
  }
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

const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount {
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
    }
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

function mapCartNode(
  node: NonNullable<CartQueryResponse["data"]>["cart"],
): Cart | null {
  if (!node) return null;

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

  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    totalPrice: formatPrice(amount, currencyCode),
    lines,
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

    return mapCartNode(data?.cart ?? null);
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
