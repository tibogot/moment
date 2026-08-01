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
  refresh_token: string;
  id_token: string;
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

function toCustomerSession(tokens: TokenResponse): CustomerSession {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

export async function getValidCustomerSession() {
  const session = await getCustomerSession();
  if (!session) return null;

  const expiresSoon = session.expiresAt - Date.now() < 60_000;
  if (!expiresSoon) return session;

  const refreshed = await refreshAccessToken(session.refreshToken);
  return refreshed ? toCustomerSession(refreshed) : null;
}

export async function refreshAndPersistCustomerSession() {
  const session = await getCustomerSession();
  if (!session) return null;

  const expiresSoon = session.expiresAt - Date.now() < 60_000;
  if (!expiresSoon) return session;

  const refreshed = await refreshAccessToken(session.refreshToken);
  if (!refreshed) {
    await clearCustomerSession();
    return null;
  }

  const nextSession = toCustomerSession(refreshed);
  await setCustomerSession(nextSession);
  return nextSession;
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

  return returnTo.startsWith("/") ? returnTo : routes.account;
}

export async function buildLogoutUrl() {
  const session = await getCustomerSession();
  await clearCustomerSession();

  if (!session?.idToken) return getLogoutRedirectUrl();

  const config = await getOpenIdConfiguration();
  const logoutUrl = new URL(config.end_session_endpoint);

  logoutUrl.searchParams.set("id_token_hint", session.idToken);
  logoutUrl.searchParams.set("post_logout_redirect_uri", getLogoutRedirectUrl());

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

  const response = await fetch(apiConfig.graphql_api, {
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
