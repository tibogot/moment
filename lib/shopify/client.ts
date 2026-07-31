import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const publicAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-01";

export function isShopifyConfigured() {
  return Boolean(storeDomain && publicAccessToken);
}

export function getShopifyClient() {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify environment variables are not configured.");
  }

  return createStorefrontApiClient({
    storeDomain: storeDomain!,
    apiVersion,
    publicAccessToken: publicAccessToken!,
  });
}
