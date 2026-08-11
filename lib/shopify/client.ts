import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import type { Locale } from "@/lib/i18n/config";

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

/**
 * Our locale as Shopify's `LanguageCode` enum.
 *
 * Every catalogue query carries it through `@inContext(language: …)`, which is
 * what makes Shopify answer with the translations entered in Translate & Adapt.
 * Without the directive the API returns the store's primary language whatever
 * the shopper is reading — the translations exist, they are simply not asked
 * for. The `Accept-Language` header is not the mechanism here.
 *
 * A language that is not published in the shop's Markets settings falls back to
 * the primary one rather than erroring, so a half-configured store degrades to
 * what it did before instead of breaking.
 */
export function shopifyLanguage(locale: Locale) {
  return locale.toUpperCase() as "FR" | "NL" | "EN";
}
