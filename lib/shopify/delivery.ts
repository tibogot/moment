import { unstable_cache } from "next/cache";
import {
  firstBookableDate,
  todayInDeliveryTimeZone,
  type DeliveryAvailability,
} from "@/lib/delivery";
import { getShopifyClient, isShopifyConfigured } from "./client";

/**
 * Days the owners close by hand — holidays, a full kitchen, staff off. They
 * live as metaobjects so the whole thing is managed in the Shopify admin
 * (Content -> Metaobjects) with no second CMS.
 *
 * Set up in Shopify, once:
 *   1. Settings -> Custom data -> Metaobjects -> Add definition
 *   2. Name it so the type resolves to `delivery_closure`
 *   3. Add a field `date` of type Date. A `reason` text field is optional and
 *      ignored here — it is for the owners' own notes.
 *   4. On the definition, enable Storefront API access, or this query comes
 *      back empty and every day reads as open.
 */
const CLOSURE_METAOBJECT_TYPE = "delivery_closure";
const CLOSURE_DATE_FIELD = "date";

/** Storefront connections cap out here. */
const CLOSURES_PAGE_SIZE = 250;

/**
 * Shorter than the catalogue's hour: an owner who blocks tomorrow expects the
 * site to stop offering it fairly quickly. Invalidate immediately with
 * `revalidateTag(DELIVERY_CACHE_TAG)` from a webhook if you want it instant.
 */
const DELIVERY_REVALIDATE = 300;
export const DELIVERY_CACHE_TAG = "shopify-delivery";

const DELIVERY_CLOSURES_QUERY = `
  query DeliveryClosures($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      edges {
        node {
          id
          fields {
            key
            value
          }
        }
      }
    }
  }
`;

type ClosuresQueryResponse = {
  data?: {
    metaobjects: {
      edges: {
        node: {
          id: string;
          fields: { key: string; value: string | null }[];
        };
      }[];
    } | null;
  };
  errors?: { message: string }[];
};

async function fetchClosures(): Promise<string[]> {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(DELIVERY_CLOSURES_QUERY, {
    variables: { type: CLOSURE_METAOBJECT_TYPE, first: CLOSURES_PAGE_SIZE },
  })) as ClosuresQueryResponse;

  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  const dates = (data?.metaobjects?.edges ?? []).map(
    ({ node }) =>
      node.fields.find((field) => field.key === CLOSURE_DATE_FIELD)?.value ??
      null,
  );

  return [...new Set(dates.filter((date): date is string => Boolean(date)))];
}

const getCachedClosures = unstable_cache(fetchClosures, ["shopify-delivery"], {
  revalidate: DELIVERY_REVALIDATE,
  tags: [DELIVERY_CACHE_TAG],
});

/**
 * Never throws: a missing metaobject definition, a token without Storefront
 * access, or Shopify being down all degrade to "no closures on file" rather
 * than taking the home page with them. The standing rules still apply.
 */
export async function getDeliveryClosures(): Promise<string[]> {
  if (!isShopifyConfigured()) return [];

  try {
    return await getCachedClosures();
  } catch (error) {
    console.error("[shopify] getDeliveryClosures failed", error);
    return [];
  }
}

export async function getDeliveryAvailability(): Promise<DeliveryAvailability> {
  const today = todayInDeliveryTimeZone();
  const firstBookable = firstBookableDate(today);
  const closedDates = await getDeliveryClosures();

  // Past closures are noise the calendar can never show — the owners are not
  // expected to tidy up old entries.
  return {
    today,
    firstBookable,
    closedDates: closedDates.filter((date) => date >= today).sort(),
  };
}
