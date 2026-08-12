import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n/config";
import {
  getShopifyClient,
  isShopifyConfigured,
  shopifyLanguage,
} from "./client";
import { SHOPIFY_CACHE_TAG, mapProductNode } from "./products";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  type CollectionByHandleQueryResponse,
  type CollectionsQueryResponse,
  type ShopifyCollection,
  type ShopifyCollectionNode,
  type ShopifyProduct,
} from "./queries";

const COLLECTIONS_PAGE_SIZE = 50;
const COLLECTION_PRODUCTS_PAGE_SIZE = 100;
const SHOPIFY_REVALIDATE = 3600;

/**
 * Occasion-based collections featured on the home "sélections" section.
 * Order is intentional — Events, Home, Office — not Shopify's title sort.
 */
export const SELECTION_COLLECTION_HANDLES = [
  "pour-les-evenements",
  "pour-la-maison",
  "pour-le-bureau",
] as const;

/** Default tab on the home sélections carousel. */
export const DEFAULT_SELECTION_HANDLE = "pour-la-maison";

export const SELECTION_COLLECTION_HANDLE_SET = new Set<string>(
  SELECTION_COLLECTION_HANDLES,
);

function mapCollectionNode(node: ShopifyCollectionNode): ShopifyCollection {
  const products = (node.products?.edges ?? []).map(({ node: productNode }) =>
    mapProductNode(productNode),
  );
  const productImage = products[0]?.imageUrl
    ? { url: products[0].imageUrl, altText: products[0].imageAlt }
    : null;

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    imageUrl: node.image?.url ?? productImage?.url ?? null,
    imageAlt: node.image?.altText ?? productImage?.altText ?? node.title,
    products,
  };
}

async function fetchCollections(
  language: Locale,
): Promise<ShopifyCollection[]> {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(COLLECTIONS_QUERY, {
    variables: {
      first: COLLECTIONS_PAGE_SIZE,
      after: null,
      language: shopifyLanguage(language),
    },
  })) as CollectionsQueryResponse;

  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return (data?.collections.edges ?? []).map(({ node }) =>
    mapCollectionNode(node),
  );
}

/** One cache entry per language — see the note in `products.ts`. */
const cachedCollections = (language: Locale) =>
  unstable_cache(
    () => fetchCollections(language),
    ["shopify-collections", language],
    { revalidate: SHOPIFY_REVALIDATE, tags: [SHOPIFY_CACHE_TAG] },
  );

/** Every collection in the store. Returns [] when Shopify isn't configured. */
export async function getCollections(
  language: Locale,
): Promise<ShopifyCollection[]> {
  if (!isShopifyConfigured()) return [];

  try {
    return await cachedCollections(language)();
  } catch (error) {
    console.error("[shopify] getCollections failed", error);
    return [];
  }
}

export type CollectionWithProducts = ShopifyCollection & {
  products: ShopifyProduct[];
};

async function fetchCollectionByHandle(
  language: Locale,
  handle: string,
): Promise<CollectionWithProducts | null> {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(COLLECTION_BY_HANDLE_QUERY, {
    variables: {
      handle,
      first: COLLECTION_PRODUCTS_PAGE_SIZE,
      after: null,
      language: shopifyLanguage(language),
    },
  })) as CollectionByHandleQueryResponse;

  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  const collection = data?.collection;
  if (!collection) return null;

  const products = collection.products.edges.map(({ node }) =>
    mapProductNode(node),
  );

  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description,
    imageUrl: collection.image?.url ?? products[0]?.imageUrl ?? null,
    imageAlt: collection.image?.altText ?? collection.title,
    products,
  } satisfies CollectionWithProducts;
}

export async function getCollectionByHandle(
  language: Locale,
  handle: string,
): Promise<CollectionWithProducts | null> {
  if (!isShopifyConfigured()) return null;

  try {
    return await unstable_cache(
      () => fetchCollectionByHandle(language, handle),
      ["shopify-collection", language, handle],
      { revalidate: SHOPIFY_REVALIDATE, tags: [SHOPIFY_CACHE_TAG] },
    )();
  } catch (error) {
    console.error(`[shopify] getCollectionByHandle(${handle}) failed`, error);
    return null;
  }
}
