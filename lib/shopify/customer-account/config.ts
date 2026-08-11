import { siteConfig } from "@/lib/site";

export const CUSTOMER_SESSION_COOKIE = "shopify_customer_session";
export const OAUTH_STATE_COOKIE = "shopify_oauth_state";
export const OAUTH_NONCE_COOKIE = "shopify_oauth_nonce";
export const OAUTH_CODE_VERIFIER_COOKIE = "shopify_oauth_code_verifier";
export const OAUTH_RETURN_TO_COOKIE = "shopify_oauth_return_to";

export const CUSTOMER_AUTH_SCOPES = "openid email customer-account-api:full";
export const OAUTH_COOKIE_MAX_AGE = 60 * 10;

export function isCustomerAccountConfigured() {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
  );
}

export function getStoreDomain() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN is not configured.");

  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getCustomerAccountClientId() {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!clientId) {
    throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID is not configured.");
  }

  return clientId;
}

export function getAppUrl() {
  const url =
    process.env.SHOPIFY_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    siteConfig.url;

  return url.replace(/\/$/, "");
}

export function getAuthCallbackUrl() {
  return `${getAppUrl()}/api/auth/callback`;
}

export function getLogoutRedirectUrl() {
  return `${getAppUrl()}/`;
}

export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: CUSTOMER_SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function getOAuthCookieOptions(name: string) {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };
}
