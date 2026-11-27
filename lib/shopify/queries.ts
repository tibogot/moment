export type ShopifyProductImage = {
  url: string;
  altText: string;
};

/** Traiteur-specific copy — populated from Shopify custom metafields on the PDP. */
export type ShopifyProductDetails = {
  ingredients: string | null;
  allergens: string | null;
  dietary: string | null;
  servingSize: string | null;
  storage: string | null;
  servingInstructions: string | null;
  traces: string | null;
};

export type ShopifyMetafield = {
  value: string;
} | null;

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  /** ISO timestamp of the last edit in Shopify — the sitemap's `lastmod`. */
  updatedAt?: string;
  description: string;
  /**
   * A few words for the cards (the carousel), from the product metafield
   * custom.short_description — "Accroche" in the admin, 40 characters at
   * most. Empty until the owners fill it in; the cards then fall back to
   * the description, cut to one line.
   */
  shortDescription: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Formatted for display, e.g. "€12.00". */
  price: string;
  /** Raw amount and currency — what Schema.org's Offer wants, unformatted. */
  priceAmount: string;
  currencyCode: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  /**
   * The default variant: the first one for sale, else the first. Kept for the
   * single-variant products (most of them) and the places that add straight
   * to the cart.
   */
  variantId: string | null;
  /**
   * Every variant the owners set up, in Shopify's order — a salad in M and L
   * (26 November 2026). One entry, titled "Default Title", for a product
   * without options.
   */
  variants: ShopifyVariant[];
  /** Variants at different prices: cards print "dès 9,00 €". */
  priceVaries: boolean;
  /** `price`, or "dès 9,00 €" when the variants' prices differ — the cards'. */
  displayPrice: string;
  /** Full gallery — only fetched on the product detail page. */
  images?: ShopifyProductImage[];
  /** Rich description from Shopify — only fetched on the product detail page. */
  descriptionHtml?: string | null;
  /** Ingredients, allergens, etc. — only fetched on the product detail page. */
  details?: ShopifyProductDetails;
};

export type ShopifyVariant = {
  id: string;
  /** "M", "L" — or "Default Title" for a product without options. */
  title: string;
  /** Formatted for display, e.g. "9,00 €". */
  price: string;
  priceAmount: string;
  availableForSale: boolean;
};

export type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  /** ISO timestamp of the last edit in Shopify — the sitemap's `lastmod`. */
  updatedAt?: string;
  description: string;
  shortDescription?: { value: string } | null;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage: { url: string; altText: string | null } | null;
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
      };
    }[];
  };
};

export type ShopifyProductDetailNode = ShopifyProductNode & {
  descriptionHtml?: string;
  images?: {
    edges: { node: { url: string; altText: string | null } }[];
  };
  ingredients?: ShopifyMetafield;
  allergens?: ShopifyMetafield;
  dietary?: ShopifyMetafield;
  serving_size?: ShopifyMetafield;
  storage?: ShopifyMetafield;
  serving_instructions?: ShopifyMetafield;
  traces?: ShopifyMetafield;
};

export type ProductsQueryResponse = {
  data?: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: ShopifyProductNode }[];
    };
  };
  errors?: { message: string }[];
};

export type ProductByHandleQueryResponse = {
  data?: { product: ShopifyProductDetailNode | null };
  errors?: { message: string }[];
};

const PRODUCT_FIELDS = `
  id
  title
  handle
  updatedAt
  description
  shortDescription: metafield(namespace: "custom", key: "short_description") {
    value
  }
  productType
  tags
  availableForSale
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  featuredImage {
    url
    altText
  }
  variants(first: 10) {
    edges {
      node {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const ALL_PRODUCTS_QUERY = `
  query AllProducts($first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ${PRODUCT_FIELDS}
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!, $language: LanguageCode)
  @inContext(language: $language) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
      descriptionHtml
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      ingredients: metafield(namespace: "custom", key: "ingredients") {
        value
      }
      allergens: metafield(namespace: "custom", key: "allergens") {
        value
      }
      dietary: metafield(namespace: "custom", key: "dietary") {
        value
      }
      serving_size: metafield(namespace: "custom", key: "serving_size") {
        value
      }
      storage: metafield(namespace: "custom", key: "storage") {
        value
      }
      serving_instructions: metafield(namespace: "custom", key: "serving_instructions") {
        value
      }
      traces: metafield(namespace: "custom", key: "traces") {
        value
      }
    }
  }
`;

/** Previews shown per collection in the shop submenu. */
export const NAV_PREVIEW_COUNT = 3;

/**
 * Products bundled with each collection for nav previews and list fallbacks.
 * One over NAV_PREVIEW_COUNT: previews are picked from the products that have
 * an image, so the query needs a spare to fall back on. Raising the preview
 * count without raising this leaves the submenu short of images.
 */
export const COLLECTION_NAV_PRODUCTS = NAV_PREVIEW_COUNT + 1;

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  /** ISO timestamp of the last edit in Shopify — the sitemap's `lastmod`. */
  updatedAt?: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  products: ShopifyProduct[];
  /** False for a collection with no product (yet). */
  hasProducts: boolean;
  /**
   * The collection's own photo in Shopify, without the first product's as a
   * fallback — the header photo of a collection page. Single collection only.
   */
  ownImageUrl?: string | null;
};

export type ShopifyCollectionNode = {
  id: string;
  title: string;
  handle: string;
  /** ISO timestamp of the last edit in Shopify — the sitemap's `lastmod`. */
  updatedAt?: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  products?: { edges: { node: ShopifyProductNode }[] };
  /** The links query only: one product id, or none. */
  firstProduct?: { edges: { node: { id: string } }[] };
};

export type CollectionsQueryResponse = {
  data?: {
    collections: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: ShopifyCollectionNode }[];
    };
  };
  errors?: { message: string }[];
};

export type CollectionByHandleQueryResponse = {
  data?: {
    collection:
      | (Omit<ShopifyCollectionNode, "products"> & {
          products: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            edges: { node: ShopifyProductNode }[];
          };
        })
      | null;
  };
  errors?: { message: string }[];
};

const COLLECTION_FIELDS = `
  id
  title
  handle
  updatedAt
  description
  image {
    url
    altText
  }
`;

/**
 * The collections without their products — what the navbar in the root layout
 * needs. Kept apart from COLLECTIONS_QUERY so the layout's cache entry carries
 * no product data and therefore no products tag: see SHOPIFY_COLLECTIONS_TAG.
 */
export const COLLECTION_LINKS_QUERY = `
  query CollectionLinks($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        node {
          ${COLLECTION_FIELDS}
          # One product id, to tell an empty collection from a full one: the
          # menu hides a family nobody has filed a product into yet.
          firstProduct: products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query Collections($first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ${COLLECTION_FIELDS}
          products(first: ${COLLECTION_NAV_PRODUCTS}) {
            edges {
              node {
                ${PRODUCT_FIELDS}
              }
            }
          }
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle(
    $handle: String!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    collection(handle: $handle) {
      ${COLLECTION_FIELDS}
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ${PRODUCT_FIELDS}
          }
        }
      }
    }
  }
`;
