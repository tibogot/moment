/**
 * The cart's cookies, in a module with no dependencies so the proxy, the
 * server actions and the browser can all import it.
 *
 * `shopify_cart_id` holds the cart and is httpOnly, as it should be: a script
 * on the page has no business reading it. That also means the browser cannot
 * tell whether a cart exists — and without knowing, every page view would ask
 * `/api/cart`, one serverless call each, mostly to learn "no cart".
 *
 * So a second cookie, `moment_has_cart=1`, says only *that* a cart exists. It
 * carries no id and nothing personal; it is set and cleared together with the
 * cart cookie (server actions) and back-filled by the proxy for carts created
 * before it existed. Listed on the cookies page as strictly necessary.
 */

export const CART_COOKIE_NAME = "shopify_cart_id";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export const CART_MARKER_COOKIE = "moment_has_cart";

export function cartMarkerOptions() {
  return {
    name: CART_MARKER_COOKIE,
    maxAge: CART_COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

/** In the browser: whether the visitor has a cart worth fetching. */
export function hasCartMarker() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${CART_MARKER_COOKIE}=`));
}
