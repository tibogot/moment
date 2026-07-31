export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  price: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
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
  data?: { product: ShopifyProductNode | null };
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
`;

export const ALL_PRODUCTS_QUERY = `
  query AllProducts($first: Int!, $after: String) {
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
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
`;

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type ShopifyCollectionNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  products: { edges: { node: { featuredImage: { url: string; altText: string | null } | null } }[] };
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
  query Collections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ${COLLECTION_FIELDS}
          products(first: 1) {
            edges {
              node {
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $first: Int!, $after: String) {
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
