/**
 * Reading metaobjects out of the Shopify admin, and the small parsers the
 * delivery rules need to turn what somebody typed there into numbers.
 *
 * The site's editable settings all take the same shape: a metaobject definition
 * whose entries the owners fill in, read through the Storefront API, cached, and
 * falling back to a default when anything at all is wrong with them. That last
 * part is the reason this is shared rather than copied — "wrong" has to mean the
 * same thing everywhere, or one setting fails safe and the next fails open.
 *
 * The one thing that catches everybody setting these up: **Storefront API access
 * has to be enabled on each definition**, or the query comes back empty and the
 * defaults apply with nothing to say they did. See SHOPIFY-SETUP.md.
 */

import { unstable_cache } from "next/cache";
import { getShopifyClient, isShopifyConfigured } from "./client";

/**
 * Shorter than the catalogue's hour: an owner who blocks tomorrow, or drops a
 * delivery fee, expects the site to catch up fairly quickly. Invalidate
 * immediately with `revalidateTag(DELIVERY_CACHE_TAG)` from a webhook if you
 * want it instant.
 */
export const DELIVERY_REVALIDATE = 300;
export const DELIVERY_CACHE_TAG = "shopify-delivery";

/** Storefront connections cap out here. */
export const METAOBJECT_PAGE_SIZE = 250;

const METAOBJECTS_QUERY = `
  query Metaobjects($type: String!, $first: Int!) {
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

type MetaobjectsQueryResponse = {
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

/** One entry's fields. Empty values are dropped, so `get` returning undefined
 * means "not filled in" without every caller having to check for `""` too. */
export type MetaobjectFields = Map<string, string>;

async function fetchMetaobjects(
  type: string,
  first: number,
): Promise<MetaobjectFields[]> {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(METAOBJECTS_QUERY, {
    variables: { type, first },
  })) as MetaobjectsQueryResponse;

  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return (data?.metaobjects?.edges ?? []).map(
    ({ node }) =>
      new Map(
        node.fields
          .filter((field): field is { key: string; value: string } =>
            Boolean(field.value),
          )
          .map((field) => [field.key, field.value]),
      ),
  );
}

/**
 * A cached reader for one metaobject type.
 *
 * Each type gets its own cache entry and its own failure: a missing definition,
 * a token without Storefront access, or Shopify being down leaves that one
 * setting on its default rather than taking the page — or the other settings —
 * down with it. Separate queries rather than one aliased document for exactly
 * that reason.
 */
export function metaobjectReader(type: string, first = METAOBJECT_PAGE_SIZE) {
  const read = unstable_cache(
    () => fetchMetaobjects(type, first),
    [`shopify-metaobject-${type}`],
    { revalidate: DELIVERY_REVALIDATE, tags: [DELIVERY_CACHE_TAG] },
  );

  return async function readEntries(): Promise<MetaobjectFields[]> {
    if (!isShopifyConfigured()) return [];

    try {
      return await read();
    } catch (error) {
      console.error(`[shopify] reading metaobject "${type}" failed`, error);
      return [];
    }
  };
}

/**
 * A whole number in `[min, max]`, or null so the caller can fall back.
 *
 * Bounded rather than merely parsed: a lead time of 400 days would close the
 * calendar entirely and a negative one would offer yesterday. Both are a slip
 * of the keyboard away in an admin field nobody validates.
 */
export function parseIntegerField(
  raw: string | undefined,
  { min, max }: { min: number; max: number },
): number | null {
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) return null;
  return value;
}

/**
 * A finite number in `[min, max]`. Shopify hands decimal fields back as strings
 * ("15.0"), which is why this exists next to the integer one rather than the
 * two sharing a parser and a rounding surprise.
 */
export function parseDecimalField(
  raw: string | undefined,
  { min, max }: { min: number; max: number },
): number | null {
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

/**
 * The entries of a list field.
 *
 * Shopify hands a list back as a JSON array inside a string. A plain
 * single-line field holds bare text, so that is accepted too — the setting
 * still works if whoever created the definition reached for the simpler field
 * type, which is the likeliest way this gets set up wrong.
 */
export function parseListField(raw: string | undefined): string[] | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return raw.split(",");
  }
}
