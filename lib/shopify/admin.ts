/**
 * The Admin API, for the one thing the Storefront API cannot do: read orders.
 *
 * Everything else on the site goes through the Storefront API with a public
 * token. Counting how full a delivery window is means reading the shop's orders
 * and tagging new ones, which needs an Admin token with `read_orders`,
 * `write_orders` and `read_all_orders` — the last because Shopify only shows an
 * app the past 60 days of orders without it, and a window booked three months
 * ahead would quietly empty itself.
 *
 * Two ways to authenticate, whichever the shop was set up with:
 *
 * - `SHOPIFY_ADMIN_ACCESS_TOKEN` — a fixed `shpat_…` token from a custom app
 *   created in the Shopify admin.
 * - `SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET` — an app created
 *   in the Dev Dashboard, in the same organisation as the shop. Exchanged for a
 *   24-hour token with the client credentials grant, held in memory.
 *
 * Neither set means capacity is off: every window is offered, as before. That
 * is the safe direction to fail in — an overbooked window is a phone call, a
 * window wrongly shown as full is a lost order nobody hears about.
 *
 * Server only. These credentials can read every customer's address.
 */

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-01";
const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

export function isAdminConfigured() {
  return Boolean(storeDomain && (staticToken || (clientId && clientSecret)));
}

let grantedToken: { value: string; expiresAt: number } | null = null;

/** Renewed this long before Shopify's own expiry, so a request never races it. */
const TOKEN_MARGIN_MS = 5 * 60 * 1000;

async function accessToken(): Promise<string> {
  if (staticToken) return staticToken;

  if (grantedToken && grantedToken.expiresAt - TOKEN_MARGIN_MS > Date.now()) {
    return grantedToken.value;
  }

  const response = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Admin token request failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    access_token: string;
    expires_in?: number;
  };

  grantedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 86_399) * 1000,
  };
  return grantedToken.value;
}

type AdminResponse<T> = { data?: T; errors?: unknown };

/**
 * One GraphQL call. Throws on anything but a clean answer — the callers decide
 * what a failure means, and for capacity it means "assume there is room".
 */
export async function adminRequest<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  if (!isAdminConfigured()) {
    throw new Error("Shopify Admin API is not configured.");
  }

  const response = await fetch(
    `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": await accessToken(),
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );

  // A rejected client-credentials token is dropped so the next call asks for
  // a fresh one, rather than failing for the rest of its 24 hours.
  if (response.status === 401) grantedToken = null;
  if (!response.ok) throw new Error(`Admin API ${response.status}`);

  const json = (await response.json()) as AdminResponse<T>;
  if (json.errors || !json.data) {
    throw new Error(`Admin API error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}
