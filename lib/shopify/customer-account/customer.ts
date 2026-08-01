import { customerAccountQuery } from "./auth";

export type CustomerProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  emailAddress: { emailAddress: string } | null;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  totalPrice: { amount: string; currencyCode: string };
};

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
            id
            name
            processedAt
            financialStatus
            totalPrice {
              amount
              currencyCode
            }
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
