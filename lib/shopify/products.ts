import { unstable_cache } from "next/cache";
import { CACHE_BACKSTOP_SECONDS } from "@/lib/cache";
import type { Locale } from "@/lib/i18n/config";
import { formatPriceAmount } from "@/lib/i18n/format";
import en from "@/lib/i18n/dictionaries/en.json";
import fr from "@/lib/i18n/dictionaries/fr.json";
import nl from "@/lib/i18n/dictionaries/nl.json";

/** "dès {price}" per language, read from the dictionaries. */
const PRICE_FROM: Record<Locale, string> = {
  fr: fr.product.priceFrom,
  nl: nl.product.priceFrom,
  en: en.product.priceFrom,
};
import {
  isShopifyConfigured,
  shopifyLanguage,
  storefrontRequest,
} from "./client";
import {
  ALL_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  type ProductByHandleQueryResponse,
  type ProductsQueryResponse,
  type ShopifyMetafield,
  type ShopifyProduct,
  type ShopifyProductDetailNode,
  type ShopifyProductDetails,
  type ShopifyProductImage,
  type ShopifyProductNode,
} from "./queries";

const PRODUCTS_PAGE_SIZE = 100;

// The catalogue changes infrequently, so cache it rather than hitting the
// Storefront API on every request. `/api/revalidate/shopify` invalidates this
// tag when Shopify says a product or collection changed; the window below is
// only the backstop for a webhook that never arrived — see `lib/cache.ts`.
//
// An hour reads as conservative and is not: `unstable_cache` lowers the
// revalidate of the route that reads it, so an hour here would put every
// product and collection page, in all three locales, on 24 rebuilds a day.
export const SHOPIFY_REVALIDATE = CACHE_BACKSTOP_SECONDS;
export const SHOPIFY_CACHE_TAG = "shopify-products";
/**
 * Part of every catalogue cache key. Bump it whenever the *shape or format* of
 * what is cached changes (a new field, a price formatted differently): the
 * data cache outlives deployments, so without a new key the old entries keep
 * being served until the backstop expires them.
 */
export const SHOPIFY_CACHE_VERSION = "v3";

/**
 * The price is formatted in the page's language — "5,50 €" in French and
 * Dutch, "€5.50" in English — the same way the cart formats its lines, so a
 * product card and the basket it goes into never disagree.
 */
export function mapProductNode(
  node: ShopifyProductNode,
  language: Locale,
): ShopifyProduct {
  const { amount, currencyCode } = node.priceRange.minVariantPrice;
  const variants = (node.variants?.edges ?? []).map(({ node: variant }) => ({
    id: variant.id,
    title: variant.title,
    price: formatPriceAmount(
      language,
      variant.price.amount,
      variant.price.currencyCode,
    ),
    priceAmount: variant.price.amount,
    availableForSale: variant.availableForSale,
  }));
  const defaultVariant =
    variants.find((variant) => variant.availableForSale) ?? variants[0];
  const price = formatPriceAmount(language, amount, currencyCode);
  const priceVaries =
    Number(node.priceRange.maxVariantPrice?.amount ?? amount) > Number(amount);

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    updatedAt: node.updatedAt,
    description: node.description,
    shortDescription: node.shortDescription?.value?.trim() ?? "",
    imageUrl: node.featuredImage?.url ?? null,
    imageAlt: node.featuredImage?.altText ?? node.title,
    price,
    priceAmount: amount,
    currencyCode,
    productType: node.productType,
    tags: node.tags,
    availableForSale: node.availableForSale,
    variantId: defaultVariant?.id ?? null,
    variants,
    priceVaries,
    displayPrice: priceVaries
      ? PRICE_FROM[language].replace("{price}", price)
      : price,
  };
}

function mapProductImages(
  node: ShopifyProductDetailNode,
): ShopifyProductImage[] {
  const gallery = (node.images?.edges ?? []).map(({ node: image }) => ({
    url: image.url,
    altText: image.altText ?? node.title,
  }));

  if (gallery.length > 0) return gallery;

  if (node.featuredImage) {
    return [
      {
        url: node.featuredImage.url,
        altText: node.featuredImage.altText ?? node.title,
      },
    ];
  }

  return [];
}

function readMetafield(field: ShopifyMetafield | undefined): string | null {
  const value = field?.value?.trim();
  return value || null;
}

function mapProductDetails(
  node: ShopifyProductDetailNode,
): ShopifyProductDetails {
  return {
    ingredients: readMetafield(node.ingredients),
    allergens: readMetafield(node.allergens),
    dietary: readMetafield(node.dietary),
    servingSize: readMetafield(node.serving_size),
    storage: readMetafield(node.storage),
    servingInstructions: readMetafield(node.serving_instructions),
    traces: readMetafield(node.traces),
  };
}

export function mapProductDetailNode(
  node: ShopifyProductDetailNode,
  language: Locale,
): ShopifyProduct {
  return {
    ...mapProductNode(node, language),
    descriptionHtml: node.descriptionHtml ?? null,
    images: mapProductImages(node),
    details: mapProductDetails(node),
  };
}

async function fetchProductsPage(language: Locale, after?: string | null) {
  const data = await storefrontRequest<
    NonNullable<ProductsQueryResponse["data"]>
  >(ALL_PRODUCTS_QUERY, {
    first: PRODUCTS_PAGE_SIZE,
    after: after ?? null,
    language: shopifyLanguage(language),
  });

  return {
    products: (data.products.edges ?? []).map(({ node }) =>
      mapProductNode(node, language),
    ),
    pageInfo: data.products.pageInfo,
  };
}

async function fetchAllProducts(language: Locale): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let after: string | null = null;

  // Page through the whole catalogue — a traiteur menu is small enough that
  // one pass at build/revalidate time is cheaper than paginating in the UI.
  do {
    const page = await fetchProductsPage(language, after);
    products.push(...page.products);
    after = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);

  return products;
}

/**
 * The language is part of the cache key, not only the query.
 *
 * One cache entry per language, because the catalogue *is* different per
 * language once Translate & Adapt is filled in. Leaving it out of the key would
 * serve whichever language warmed the cache first to everybody — the kind of
 * bug that looks like "the translations do not work" and is really "they
 * worked once, for one visitor".
 */
const cachedProducts = (language: Locale) =>
  unstable_cache(
    () => fetchAllProducts(language),
    ["shopify-products", SHOPIFY_CACHE_VERSION, language],
    {
      revalidate: SHOPIFY_REVALIDATE,
      tags: [SHOPIFY_CACHE_TAG],
    },
  );

/** Every product in the store. Returns [] when Shopify isn't configured. */
export async function getProducts(language: Locale): Promise<ShopifyProduct[]> {
  if (!isShopifyConfigured()) return [];

  try {
    // Sold-out products last, everything else in Shopify's order (stable
    // sort). A shop that opened on two "Épuisé" cards — products the owners
    // were still filling in — looked unfinished (audit, 26 November 2026).
    const products = await cachedProducts(language)();
    return [...products].sort(
      (a, b) => Number(b.availableForSale) - Number(a.availableForSale),
    );
  } catch (error) {
    console.error("[shopify] getProducts failed", error);
    return [];
  }
}

const SIMILAR_PRODUCTS_LIMIT = 6;

/** Same product type first, then anything else from the catalogue. */
export function getSimilarProducts(
  allProducts: ShopifyProduct[],
  current: ShopifyProduct,
  limit = SIMILAR_PRODUCTS_LIMIT,
): ShopifyProduct[] {
  const others = allProducts.filter(
    (product) => product.handle !== current.handle,
  );
  if (others.length === 0) return [];

  const sameType = current.productType
    ? others.filter((product) => product.productType === current.productType)
    : [];

  return (sameType.length > 0 ? sameType : others).slice(0, limit);
}

async function fetchProductByHandle(
  language: Locale,
  handle: string,
): Promise<ShopifyProduct | null> {
  const data = await storefrontRequest<
    NonNullable<ProductByHandleQueryResponse["data"]>
  >(PRODUCT_BY_HANDLE_QUERY, {
    handle,
    language: shopifyLanguage(language),
  });

  return data.product ? mapProductDetailNode(data.product, language) : null;
}

/**
 * Throws when Shopify fails, and returns `null` only when the handle really
 * does not exist. The difference matters to the page: `null` becomes a cached
 * 404, while a thrown render keeps the last good page (ISR) until Shopify is
 * back — so an outage during a rebuild cannot cache "not found" for a product
 * that is still on sale.
 */
export async function getProductByHandle(
  language: Locale,
  handle: string,
): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured()) return null;

  try {
    return await unstable_cache(
      () => fetchProductByHandle(language, handle),
      ["shopify-product", SHOPIFY_CACHE_VERSION, language, handle],
      { revalidate: SHOPIFY_REVALIDATE, tags: [SHOPIFY_CACHE_TAG] },
    )();
  } catch (error) {
    console.error(`[shopify] getProductByHandle(${handle}) failed`, error);
    throw error;
  }
}
