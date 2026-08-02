import { unstable_cache } from "next/cache";
import { getShopifyClient, isShopifyConfigured } from "./client";
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
// Storefront API on every request. Invalidate on demand with
// `revalidateTag(SHOPIFY_CACHE_TAG)` from a webhook.
const SHOPIFY_REVALIDATE = 3600;
export const SHOPIFY_CACHE_TAG = "shopify-products";

export function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function mapProductNode(node: ShopifyProductNode): ShopifyProduct {
  const { amount, currencyCode } = node.priceRange.minVariantPrice;

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    imageUrl: node.featuredImage?.url ?? null,
    imageAlt: node.featuredImage?.altText ?? node.title,
    price: formatPrice(amount, currencyCode),
    productType: node.productType,
    tags: node.tags,
    availableForSale: node.availableForSale,
    variantId: node.variants?.edges[0]?.node.id ?? null,
  };
}

function mapProductImages(node: ShopifyProductDetailNode): ShopifyProductImage[] {
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
): ShopifyProduct {
  return {
    ...mapProductNode(node),
    descriptionHtml: node.descriptionHtml ?? null,
    images: mapProductImages(node),
    details: mapProductDetails(node),
  };
}

async function fetchProductsPage(after?: string | null) {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(ALL_PRODUCTS_QUERY, {
    variables: { first: PRODUCTS_PAGE_SIZE, after: after ?? null },
  })) as ProductsQueryResponse;

  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return {
    products: (data?.products.edges ?? []).map(({ node }) =>
      mapProductNode(node),
    ),
    pageInfo: data?.products.pageInfo,
  };
}

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let after: string | null = null;

  // Page through the whole catalogue — a traiteur menu is small enough that
  // one pass at build/revalidate time is cheaper than paginating in the UI.
  do {
    const page = await fetchProductsPage(after);
    products.push(...page.products);
    after = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);

  return products;
}

const getCachedProducts = unstable_cache(fetchAllProducts, ["shopify-products"], {
  revalidate: SHOPIFY_REVALIDATE,
  tags: [SHOPIFY_CACHE_TAG],
});

/** Every product in the store. Returns [] when Shopify isn't configured. */
export async function getProducts(): Promise<ShopifyProduct[]> {
  if (!isShopifyConfigured()) return [];

  try {
    return await getCachedProducts();
  } catch (error) {
    console.error("[shopify] getProducts failed", error);
    return [];
  }
}

const SIMILAR_PRODUCTS_LIMIT = 3;

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
  handle: string,
): Promise<ShopifyProduct | null> {
  const client = getShopifyClient();
  const { data, errors } = (await client.request(PRODUCT_BY_HANDLE_QUERY, {
    variables: { handle },
  })) as ProductByHandleQueryResponse;

  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return data?.product ? mapProductDetailNode(data.product) : null;
}

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured()) return null;

  try {
    return await unstable_cache(
      () => fetchProductByHandle(handle),
      ["shopify-product", handle],
      { revalidate: SHOPIFY_REVALIDATE, tags: [SHOPIFY_CACHE_TAG] },
    )();
  } catch (error) {
    console.error(`[shopify] getProductByHandle(${handle}) failed`, error);
    return null;
  }
}
