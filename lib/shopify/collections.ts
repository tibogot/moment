import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n/config";
import { isShopifyConfigured, shopifyLanguage, storefrontRequest } from "./client";
import {
  SHOPIFY_CACHE_TAG,
  SHOPIFY_REVALIDATE,
  mapProductNode,
} from "./products";
import {
  COLLECTION_LINKS_QUERY,
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

/**
 * Occasion-based collections featured on the home "sélections" section.
 * Order is intentional — Events, Home, Office — not Shopify's title sort.
 */
export const SELECTION_COLLECTION_HANDLES = [
  "pour-les-evenements",
  "pour-la-maison",
  "pour-le-bureau",
] as const;

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
  const data = await storefrontRequest<
    NonNullable<CollectionsQueryResponse["data"]>
  >(COLLECTIONS_QUERY, {
    first: COLLECTIONS_PAGE_SIZE,
    after: null,
    language: shopifyLanguage(language),
  });

  return (data.collections.edges ?? []).map(({ node }) =>
    mapCollectionNode(node),
  );
}

/**
 * Collections without products, for the navbar in the root layout.
 *
 * Its own tag, because the layout is on every page: anything it reads under
 * the products tag is invalidated by every product edit and every stock
 * change — one per order line — which rebuilt the whole site, in three
 * languages, after every sale. The layout now only rebuilds when a collection
 * itself changes. Product-bearing reads below carry both tags.
 */
export const SHOPIFY_COLLECTIONS_TAG = "shopify-collections";

/** One cache entry per language — see the note in `products.ts`. */
const cachedCollections = (language: Locale) =>
  unstable_cache(
    () => fetchCollections(language),
    ["shopify-collections", language],
    {
      revalidate: SHOPIFY_REVALIDATE,
      tags: [SHOPIFY_CACHE_TAG, SHOPIFY_COLLECTIONS_TAG],
    },
  );

type CollectionLinksResponse = {
  collections: { edges: { node: ShopifyCollectionNode }[] };
};

const cachedCollectionLinks = (language: Locale) =>
  unstable_cache(
    async () => {
      const data = await storefrontRequest<CollectionLinksResponse>(
        COLLECTION_LINKS_QUERY,
        { first: COLLECTIONS_PAGE_SIZE, language: shopifyLanguage(language) },
      );
      return data.collections.edges.map(({ node }) => mapCollectionNode(node));
    },
    ["shopify-collection-links", language],
    { revalidate: SHOPIFY_REVALIDATE, tags: [SHOPIFY_COLLECTIONS_TAG] },
  );

/**
 * Every collection's title, handle and image, with `products: []`. For the
 * root layout; anything that shows products uses `getCollections`.
 */
export async function getCollectionLinks(
  language: Locale,
): Promise<ShopifyCollection[]> {
  if (!isShopifyConfigured()) return [];

  try {
    return await cachedCollectionLinks(language)();
  } catch (error) {
    console.error("[shopify] getCollectionLinks failed", error);
    return [];
  }
}

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
  const data = await storefrontRequest<
    NonNullable<CollectionByHandleQueryResponse["data"]>
  >(COLLECTION_BY_HANDLE_QUERY, {
    handle,
    first: COLLECTION_PRODUCTS_PAGE_SIZE,
    after: null,
    language: shopifyLanguage(language),
  });

  const collection = data.collection;
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
      {
        revalidate: SHOPIFY_REVALIDATE,
        tags: [SHOPIFY_CACHE_TAG, SHOPIFY_COLLECTIONS_TAG],
      },
    )();
  } catch (error) {
    console.error(`[shopify] getCollectionByHandle(${handle}) failed`, error);
    return null;
  }
}
