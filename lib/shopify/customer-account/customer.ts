import { customerAccountQuery } from "./auth";

export type CustomerProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  emailAddress: { emailAddress: string } | null;
};

export type CustomerOrderLine = {
  name: string;
  quantity: number;
  /** Null once the product or variant has been deleted from the shop. */
  variantId: string | null;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  totalPrice: { amount: string; currencyCode: string };
  /** Shopify's own order page — tracking, receipt, what was charged. */
  statusPageUrl: string | null;
  lineItems: { nodes: CustomerOrderLine[] };
};

/**
 * Enough to show what was in the order and to put it back in a basket. Fifty
 * lines covers any catering order; the reorder re-reads the order on its own,
 * so what the page shows is never what gets added.
 */
const ORDER_FIELDS = `
  id
  name
  processedAt
  financialStatus
  statusPageUrl
  totalPrice {
    amount
    currencyCode
  }
  lineItems(first: 50) {
    nodes {
      name
      quantity
      variantId
    }
  }
`;

const CUSTOMER_QUERY = `
  query Customer {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            ${ORDER_FIELDS}
          }
        }
      }
    }
  }
`;

type CustomerQueryData = {
  customer:
    | (CustomerProfile & {
        orders: { edges: { node: CustomerOrder }[] };
      })
    | null;
};

export async function getCustomerProfile() {
  const result = await customerAccountQuery<CustomerQueryData>(CUSTOMER_QUERY);

  if (!result.ok) return { ok: false as const, error: result.error };

  const customer = result.data?.customer ?? null;

  return {
    ok: true as const,
    customer,
    orders: customer?.orders.edges.map(({ node }) => node) ?? [],
  };
}

const ORDER_QUERY = `
  query CustomerOrder($id: ID!) {
    order(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`;

/**
 * One of the signed-in customer's own orders, by id. The Customer Account API
 * only answers for the token's owner, so an id from someone else's order comes
 * back null — which is what makes it safe to take the id from the browser.
 */
export async function getCustomerOrder(id: string) {
  const result = await customerAccountQuery<{ order: CustomerOrder | null }>(
    ORDER_QUERY,
    { id },
  );

  if (!result.ok) return { ok: false as const, error: result.error };
  return { ok: true as const, order: result.data?.order ?? null };
}
