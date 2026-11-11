import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import type { Locale } from "@/lib/i18n/config";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const publicAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-10";

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
 * One Storefront request that throws on anything but a clean answer.
 *
 * `@shopify/storefront-api-client` does not throw on failure. A 429, a 5xx, a
 * network error and a GraphQL error all come back as a resolved response
 * carrying `errors` — an **object** (`{ message, networkStatusCode,
 * graphQLErrors }`), not an array — and no `data`. Testing `errors?.length`
 * is always false, so every outage would read as "no cart" or "no products":
 * a basket replaced, an empty shop cached for a day.
 *
 * So every caller goes through here. A failure throws, which keeps it out of
 * `unstable_cache` and lets each caller choose what an outage means; `null`
 * fields inside a successful answer (a cart that has expired, a handle that
 * does not exist) are left for the caller to read as such.
 */
export async function storefrontRequest<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const response = await getShopifyClient().request<TData>(query, {
    variables,
  });

  if (response.errors || !response.data) {
    const { message, networkStatusCode, graphQLErrors } = response.errors ?? {};
    throw new Error(
      `Storefront request failed` +
        (networkStatusCode ? ` (${networkStatusCode})` : "") +
        `: ${message ?? "no data"}` +
        (graphQLErrors?.length ? ` ${JSON.stringify(graphQLErrors)}` : ""),
    );
  }

  return response.data;
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
