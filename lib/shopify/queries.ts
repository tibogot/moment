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
  description: string;
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
  /** First variant — traiteur products are single-variant, so this is the one. */
  variantId: string | null;
  /** Full gallery — only fetched on the product detail page. */
  images?: ShopifyProductImage[];
  /** Rich description from Shopify — only fetched on the product detail page. */
  descriptionHtml?: string | null;
  /** Ingredients, allergens, etc. — only fetched on the product detail page. */
  details?: ShopifyProductDetails;
};

export type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage: { url: string; altText: string | null } | null;
  variants: {
    edges: { node: { id: string; availableForSale: boolean } }[];
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
  description
  productType
  tags
  availableForSale
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  featuredImage {
    url
    altText
  }
  variants(first: 1) {
    edges {
      node {
        id
        availableForSale
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
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  products: ShopifyProduct[];
};

export type ShopifyCollectionNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  products: { edges: { node: ShopifyProductNode }[] };
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
  description
  image {
    url
    altText
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
