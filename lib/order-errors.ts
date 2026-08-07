/**
 * Why a cart action refused, as a code rather than a sentence.
 *
 * The actions used to return finished English prose, which the components put
 * straight on screen. That was fine while the site had one language and became
 * a bug the day it had three: these are the messages a customer reads at the
 * exact moment their order will not go through, and showing them in the wrong
 * language there is worse than anywhere else on the site.
 *
 * Server Actions cannot reach the dictionary — they have no locale, and giving
 * them one would mean passing it in from every call site and trusting it. So
 * they name the reason and the component, which does know the language, says it.
 *
 * `cart_failed` deliberately flattens everything Shopify tells us. Those
 * messages arrive in English from their API, they are written for developers,
 * and they are already logged server-side in lib/shopify/cart.ts — the customer
 * gets one honest sentence instead.
 */
export type OrderErrorCode =
  | "not_configured"
  | "date_unavailable"
  | "address_not_found"
  | "unknown_method"
  | "no_cart"
  | "cart_failed";

export type OrderFailure = { ok: false; code: OrderErrorCode };

export function orderFailure(code: OrderErrorCode): OrderFailure {
  return { ok: false, code };
}
