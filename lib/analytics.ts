/**
 * Google Analytics 4, behind the visitor's consent.
 *
 * Asked for by the owners on 3 November 2026: audience, traffic sources,
 * conversions and purchases, with GDPR-compliant consent. The rules this file
 * keeps:
 *
 * - **Nothing loads before consent.** `gtag.js` is only injected by
 *   `ConsentScripts` once the visitor accepts the analytics category — the
 *   "basic" Consent Mode the Belgian APD's guidance points to. Before that
 *   there is no Google request and no `_ga` cookie, so every helper below is a
 *   no-op until `window.gtag` exists.
 * - **Off unless configured.** `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set on the
 *   production deployment only (G-43F991WPBG). Unset — local, preview — there
 *   is no tag and no analytics category in the banner, so preview traffic never
 *   lands in the owners' reports and nobody is asked to accept a cookie that is
 *   not there.
 * - **No advertising signals.** `ad_storage`, `ad_user_data` and
 *   `ad_personalization` stay denied; the banner's "marketing" category is not
 *   offered because nothing uses it.
 *
 * Purchases happen on Shopify's checkout, another domain this script cannot
 * see. `checkoutAnalyticsAttributes` hands the visitor's GA ids to the cart so
 * the Shopify custom pixel (docs/shopify-ga4-pixel.js) can send the purchase as
 * the same visitor. See docs/shopify-setup.md, "Google Analytics".
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function isAnalyticsConfigured() {
  return /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID);
}

/**
 * `_ga` and `_ga_<id>` lifetime: 13 months, the ceiling the APD and the
 * French CNIL apply to audience-measurement cookies. GA's own default is two
 * years. Listed on the cookies page — change both together.
 */
export const GA_COOKIE_EXPIRES_SECONDS = 60 * 60 * 24 * 395;

type Gtag = (...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof fn === "function" ? fn : null;
}

/**
 * Events raised before gtag exists. On the page a visitor lands on, the page's
 * own effects run before the layout's `ConsentScripts` has injected the tag,
 * so a `view_item` there would be lost. They wait here, in memory only, and
 * are sent if and when consent loads the tag — and are simply dropped with the
 * page if it never does.
 */
const pending: unknown[][] = [];
const MAX_PENDING = 20;

function send(...args: unknown[]) {
  if (!isAnalyticsConfigured()) return;
  const fn = gtag();
  if (fn) fn(...args);
  else if (pending.length < MAX_PENDING) pending.push(args);
}

/** Called by `ConsentScripts` right after it defines `window.gtag`. */
export function flushPendingAnalytics() {
  const fn = gtag();
  if (!fn) return;
  for (const args of pending.splice(0)) fn(...args);
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

const CURRENCY = "EUR";

/** A product page was seen. */
export function trackViewItem(item: AnalyticsItem) {
  send("event", "view_item", {
    currency: CURRENCY,
    value: item.price ?? 0,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  send("event", "add_to_cart", {
    currency: CURRENCY,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(value: number, items: AnalyticsItem[]) {
  send("event", "begin_checkout", { currency: CURRENCY, value, items });
}

/** A quote or contact request went through — the catering conversion. */
export function trackGenerateLead(kind: "enquiry" | "pro") {
  send("event", "generate_lead", { lead_type: kind });
}

/**
 * The visitor's GA client and session ids, for the cart attributes the
 * checkout pixel reads. Null when analytics is not running — no consent, not
 * configured, or blocked — in which case the pixel sends nothing either.
 *
 * Read with `gtag('get')` and a short timeout: an ad blocker can leave a stub
 * `gtag` whose callback never fires, and checkout must not wait on it.
 */
export async function analyticsIds(): Promise<{
  clientId: string;
  sessionId: string | null;
} | null> {
  const fn = gtag();
  if (!fn || !isAnalyticsConfigured()) return null;

  const read = (field: string) =>
    new Promise<string | null>((resolve) => {
      const timer = window.setTimeout(() => resolve(null), 500);
      fn("get", GA_MEASUREMENT_ID, field, (value: unknown) => {
        window.clearTimeout(timer);
        resolve(value == null ? null : String(value));
      });
    });

  const [clientId, sessionId] = await Promise.all([
    read("client_id"),
    read("session_id"),
  ]);
  return clientId ? { clientId, sessionId } : null;
}

/**
 * The cart attributes the Shopify pixel looks for. Leading underscore: Shopify
 * hides such attributes from the customer at checkout and keeps them off the
 * order confirmation, so they never read as part of the order.
 */
export const GA_CLIENT_ID_ATTRIBUTE = "_ga_client_id";
export const GA_SESSION_ID_ATTRIBUTE = "_ga_session_id";
