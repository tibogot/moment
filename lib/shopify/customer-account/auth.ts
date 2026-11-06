import { cookies } from "next/headers";
import {
  CUSTOMER_AUTH_SCOPES,
  getAppUrl,
  getAuthCallbackUrl,
  getCustomerAccountClientId,
  getLogoutRedirectUrl,
  getOAuthCookieOptions,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_RETURN_TO_COOKIE,
  OAUTH_STATE_COOKIE,
} from "./config";
import {
  getCustomerAccountApiConfiguration,
  getOpenIdConfiguration,
} from "./discovery";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from "./pkce";
import {
  clearCustomerSession,
  getCustomerSession,
  setCustomerSession,
  type CustomerSession,
} from "./session";
import { routes } from "@/lib/routes";

type TokenResponse = {
  access_token: string;
  /** Present on sign-in; a refresh may leave it out when it is not rotated. */
  refresh_token?: string;
  /** Present on sign-in; a refresh may leave it out. */
  id_token?: string;
  expires_in: number;
};

const USER_AGENT = "Moment-Storefront/1.0";

function getTokenRequestHeaders() {
  return {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json",
    origin: getAppUrl(),
    "user-agent": USER_AGENT,
  };
}

async function exchangeAuthorizationCode(code: string, codeVerifier: string) {
  const config = await getOpenIdConfiguration();
  const body = new URLSearchParams();

  body.set("grant_type", "authorization_code");
  body.set("client_id", getCustomerAccountClientId());
  body.set("redirect_uri", getAuthCallbackUrl());
  body.set("code", code);
  body.set("code_verifier", codeVerifier);

  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers: getTokenRequestHeaders(),
    body,
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${await response.text()}`);
  }

  return (await response.json()) as TokenResponse;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const config = await getOpenIdConfiguration();
    const body = new URLSearchParams();

    body.set("grant_type", "refresh_token");
    body.set("client_id", getCustomerAccountClientId());
    body.set("refresh_token", refreshToken);

    const response = await fetch(config.token_endpoint, {
      method: "POST",
      headers: getTokenRequestHeaders(),
      body,
    });

    if (!response.ok) return null;

    return (await response.json()) as TokenResponse;
  } catch {
    return null;
  }
}

/**
 * `previous` is the session being refreshed. A refresh response is allowed to
 * leave out the refresh token (when it is not rotated) and the id token, and a
 * session missing either is rejected when the cookie is read back — so the
 * customer would be signed out an hour after signing in. The old values carry
 * over instead.
 */
function toCustomerSession(
  tokens: TokenResponse,
  previous?: CustomerSession,
): CustomerSession {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || previous?.refreshToken || "",
    idToken: tokens.id_token || previous?.idToken || "",
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

/** Within a minute of expiry, which is too close to start a request on. */
export function sessionIsExpiring(session: CustomerSession) {
  return session.expiresAt - Date.now() < 60_000;
}

/**
 * The session, if it can be used as it is — never refreshed here.
 *
 * This is called while rendering, and a render cannot write a cookie.
 * Refreshing anyway and throwing the result away would make every render after
 * the first hour pay for a token exchange, and if Shopify retires a refresh
 * token once it has been used, the next one would fail and the customer bounce
 * between the account page and sign-in. An expiring session is the caller's cue to go
 * through `/api/auth/refresh`, which can save what it gets.
 */
export async function getValidCustomerSession() {
  const session = await getCustomerSession();
  if (!session || sessionIsExpiring(session)) return null;
  return session;
}

export async function refreshAndPersistCustomerSession() {
  const session = await getCustomerSession();
  if (!session) return null;

  if (!sessionIsExpiring(session)) return session;

  const refreshed = await refreshAccessToken(session.refreshToken);
  if (!refreshed) {
    await clearCustomerSession();
    return null;
  }

  const nextSession = toCustomerSession(refreshed, session);
  await setCustomerSession(nextSession);
  return nextSession;
}

/**
 * Where to land after signing in — a path on this site, or the account page.
 *
 * "Starts with a slash" is not enough: `//evil.com`
 * and `/\evil.com` both start with one, and browsers read both as another
 * host. A phishing link through the real Shopify login would then deliver the
 * customer, freshly signed in and trusting it, to someone else's page. So the
 * value is resolved against a placeholder origin and must stay on it.
 */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return routes.account;

  try {
    const base = "https://return.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return routes.account;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return routes.account;
  }
}

export async function buildAuthorizationUrl(returnTo: string) {
  const config = await getOpenIdConfiguration();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();
  const nonce = generateNonce();
  const cookieStore = await cookies();

  const stateCookie = getOAuthCookieOptions(OAUTH_STATE_COOKIE);
  const nonceCookie = getOAuthCookieOptions(OAUTH_NONCE_COOKIE);
  const verifierCookie = getOAuthCookieOptions(OAUTH_CODE_VERIFIER_COOKIE);
  const returnToCookie = getOAuthCookieOptions(OAUTH_RETURN_TO_COOKIE);

  cookieStore.set(stateCookie.name, state, stateCookie);
  cookieStore.set(nonceCookie.name, nonce, nonceCookie);
  cookieStore.set(verifierCookie.name, codeVerifier, verifierCookie);
  cookieStore.set(returnToCookie.name, returnTo, returnToCookie);

  const authorizationUrl = new URL(config.authorization_endpoint);

  authorizationUrl.searchParams.set("scope", CUSTOMER_AUTH_SCOPES);
  authorizationUrl.searchParams.set("client_id", getCustomerAccountClientId());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", getAuthCallbackUrl());
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);
  authorizationUrl.searchParams.set("locale", "en");
  authorizationUrl.searchParams.set("region_country", "BE");
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  return authorizationUrl.toString();
}

export async function completeAuthorizationCallback(
  searchParams: URLSearchParams,
) {
  const error = searchParams.get("error");
  if (error) {
    throw new Error(searchParams.get("error_description") ?? error);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    throw new Error("Missing authorization code or state.");
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;
  const returnTo =
    cookieStore.get(OAUTH_RETURN_TO_COOKIE)?.value ?? routes.account;

  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_NONCE_COOKIE);
  cookieStore.delete(OAUTH_CODE_VERIFIER_COOKIE);
  cookieStore.delete(OAUTH_RETURN_TO_COOKIE);

  if (!storedState || storedState !== state) {
    throw new Error("Invalid OAuth state.");
  }

  if (!codeVerifier) {
    throw new Error("Missing OAuth code verifier.");
  }

  const tokens = await exchangeAuthorizationCode(code, codeVerifier);
  await setCustomerSession(toCustomerSession(tokens));

  return safeReturnPath(returnTo);
}

export async function buildLogoutUrl() {
  const session = await getCustomerSession();
  await clearCustomerSession();

  if (!session?.idToken) return getLogoutRedirectUrl();

  const config = await getOpenIdConfiguration();
  const logoutUrl = new URL(config.end_session_endpoint);

  logoutUrl.searchParams.set("id_token_hint", session.idToken);
  logoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    getLogoutRedirectUrl(),
  );

  return logoutUrl.toString();
}

export async function customerAccountQuery<TData>(
  query: string,
  variables?: Record<string, unknown>,
) {
  const session = await getValidCustomerSession();
  if (!session) {
    return { ok: false as const, error: "not_authenticated" as const };
  }

  let apiConfig;
  try {
    apiConfig = await getCustomerAccountApiConfiguration();
  } catch {
    return { ok: false as const, error: "config_unavailable" as const };
  }

  let response: Response;
  try {
    response = await fetch(apiConfig.graphql_api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: session.accessToken,
        origin: getAppUrl(),
        "user-agent": USER_AGENT,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
  } catch {
    return { ok: false as const, error: "request_failed" as const };
  }

  // A token Shopify refuses before it has expired has been revoked — signed
  // out on another device, or the account closed. Not a retryable failure.
  if (response.status === 401) {
    return { ok: false as const, error: "not_authenticated" as const };
  }

  if (!response.ok) {
    return { ok: false as const, error: "request_failed" as const };
  }

  const payload = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };

  if (payload.errors?.length) {
    return {
      ok: false as const,
      error: payload.errors[0]?.message ?? "graphql_error",
    };
  }

  return { ok: true as const, data: payload.data as TData };
}
