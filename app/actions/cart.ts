"use server";

import { cookies, headers } from "next/headers";
import { CART_MARKER_COOKIE, cartMarkerOptions } from "@/lib/cart-cookie";
import {
  addLinesToCart,
  addVariantToCart,
  availableVariantIds,
  getCartCookieOptions,
  lookupCart,
  removeCartLines,
  setCartAttributes,
  updateCartLineQuantity,
} from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/shopify/client";
import {
  getDeliveryAvailability,
  getDeliverySlots,
  getPickupSlots,
} from "@/lib/shopify/delivery";
import { getDeliveryRules, getZoneTable } from "@/lib/shopify/zones";
import { getFullSlots } from "@/lib/shopify/capacity";
import {
  GA_CLIENT_ID_ATTRIBUTE,
  GA_SESSION_ID_ATTRIBUTE,
} from "@/lib/analytics";
import { getCustomerOrder } from "@/lib/shopify/customer-account/customer";
import { checkoutBlocker, orderRules } from "@/lib/delivery/checkout";
import { toLocale, type Locale } from "@/lib/i18n/config";
import { resolveAddress } from "@/lib/address";
import { DELIVERY_DATE_ATTRIBUTE, isBookable } from "@/lib/delivery/dates";
import {
  DELIVERY_SLOT_ATTRIBUTE,
  findSlot,
  slotAttributeValue,
} from "@/lib/delivery/slots";
import {
  DELIVERY_ZONE_ATTRIBUTE,
  formatZoneAttribute,
  resolveDeliveryZone,
} from "@/lib/delivery/zones";
import {
  DELIVERY_ADDRESS_ATTRIBUTE,
  DELIVERY_METHOD_ATTRIBUTE,
  DELIVERY_NOTE_ATTRIBUTE,
  DELIVERY_NOTE_MAX,
  deliveryMethodAttributeValue,
  isDeliveryMethod,
  type DeliveryMethod,
} from "@/lib/delivery/order-preferences";
import { orderFailure } from "@/lib/order-errors";
import { clientAddress, takeToken } from "@/lib/rate-limit";

/** Matches the cap in `updateCartLine`; a catering order never needs more. */
const MAX_LINE_QUANTITY = 999;

/** A street, a number and a town fit comfortably; same cap as /api/address. */
const MAX_ADDRESS_LENGTH = 120;

/** Saving an address is a deliberate click, not a keystroke. */
const ADDRESS_SAVE_LIMIT = { limit: 20, windowMs: 60_000 };

async function getCartIdFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(getCartCookieOptions().name)?.value;
}

async function setCartCookie(cartId: string) {
  const cookieStore = await cookies();
  const options = getCartCookieOptions();
  cookieStore.set(options.name, cartId, options);
  // Lets the browser know a cart exists without reading its id — see
  // lib/cart-cookie.ts.
  const marker = cartMarkerOptions();
  cookieStore.set(marker.name, "1", marker);
}

async function clearCartCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(getCartCookieOptions().name);
  cookieStore.delete(CART_MARKER_COOKIE);
}

/**
 * Every one of these takes the locale from its caller.
 *
 * The cart is one basket shared by three languages — the cookie does not care
 * which one the shopper is reading — so the *language of a read* is a property
 * of the page asking, not of the cart. Shopify contextualises the line titles
 * and the prices from it, which is why a mutation returning the new cart has to
 * carry it too: the panel repaints from that response.
 */
export async function getCart(locale: Locale) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return null;

  const cartId = await getCartIdFromCookies();
  if (!cartId) return null;

  const lookup = await lookupCart(locale, cartId);

  // Only a cart Shopify says is gone loses its cookie. On a failed read the
  // badge shows empty for one render, and the basket is still there on the next.
  if (lookup.kind === "missing") await clearCartCookie();

  return lookup.kind === "found" ? lookup.cart : null;
}

export async function addToCart(
  locale: Locale,
  variantId: string,
  quantity = 1,
) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
    return orderFailure("cart_failed");
  }

  // A cart Shopify no longer has (expired, or already checked out) is replaced
  // inside `addVariantToCart`; any other failure leaves the cookie alone, so a
  // timeout costs one click rather than the basket.
  const existingCartId = await getCartIdFromCookies();
  const result = await addVariantToCart(
    locale,
    variantId,
    quantity,
    existingCartId,
  );

  if (!result.ok) return orderFailure("cart_failed");

  await setCartCookie(result.cartId);

  return {
    ok: true as const,
    totalQuantity: result.totalQuantity,
    cart: result.cart,
  };
}

/**
 * "Recommander": a past order's lines, back in the basket.
 *
 * The order is re-read from the Customer Account API by id rather than taking
 * lines from the browser, so nobody can submit a basket and call it an order —
 * and the API only returns the signed-in customer's own orders, so an id from
 * someone else's comes back as nothing.
 *
 * Added to the existing basket rather than replacing it: someone halfway
 * through a new order who taps "recommander" on last month's wants both.
 * Lines that can no longer be bought are skipped and counted, so the page can
 * say "2 products are no longer available" rather than failing the lot. The
 * day, window and address are not copied — those are a new decision.
 */
export async function reorder(locale: Locale, orderId: string) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const result = await getCustomerOrder(orderId);
  if (!result.ok && result.error === "not_authenticated") {
    return orderFailure("session_expired");
  }
  if (!result.ok || !result.order) return orderFailure("cart_failed");

  // The same variant can appear on two lines (a discount splits it); one line
  // per variant keeps the basket tidy and the quantities right.
  const quantities = new Map<string, number>();
  let skipped = 0;
  for (const line of result.order.lineItems.nodes) {
    if (!line.variantId || line.quantity <= 0) {
      skipped += 1;
      continue;
    }
    quantities.set(
      line.variantId,
      (quantities.get(line.variantId) ?? 0) + line.quantity,
    );
  }

  let available: Set<string>;
  try {
    available = await availableVariantIds([...quantities.keys()]);
  } catch {
    return orderFailure("cart_failed");
  }

  const lines = [...quantities].flatMap(([merchandiseId, quantity]) => {
    if (available.has(merchandiseId)) return [{ merchandiseId, quantity }];
    skipped += 1;
    return [];
  });

  if (lines.length === 0) {
    return { ok: true as const, added: 0, skipped };
  }

  const added = await addLinesToCart(
    locale,
    lines,
    await getCartIdFromCookies(),
  );
  if (!added.ok) return orderFailure("cart_failed");

  await setCartCookie(added.cartId);

  return { ok: true as const, added: lines.length, skipped };
}

/**
 * Merges a patch of order preferences onto the cart, with the same stale-cart
 * recovery as addToCart — which lives in `setCartAttributes`, and only fires
 * when Shopify says the cart is gone.
 */
async function saveOrderPreferences(
  locale: Locale,
  patch: Record<string, string | null>,
) {
  const existingCartId = await getCartIdFromCookies();
  const result = await setCartAttributes(locale, patch, existingCartId);

  if (!result.ok) return orderFailure("cart_failed");

  await setCartCookie(result.cartId);

  return { ok: true as const, cart: result.cart };
}

/**
 * The calendar's own paint job is only as fresh as the page it was rendered
 * into, so the rules are checked again here against live availability. A page
 * left open overnight, or one served from the static shell, cannot book a day
 * the owners have since closed.
 */
export async function setDeliveryDate(locale: Locale, isoDate: string) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const [availability, zones, cart] = await Promise.all([
    getDeliveryAvailability(),
    getZoneTable(),
    getCart(locale),
  ]);
  if (availability.closuresUnavailable) {
    return orderFailure("rules_unavailable");
  }
  // Against the rules for this basket: a next-day collection may book
  // tomorrow, anything else keeps the standard notice.
  const rules = orderRules(
    {
      deliveryMethod: cart?.deliveryMethod ?? null,
      lines: cart?.lines ?? [],
    },
    availability,
    zones,
  );
  if (!isBookable(isoDate, rules.availability)) {
    return orderFailure("date_unavailable");
  }

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_DATE_ATTRIBUTE]: isoDate,
  });
  if (!saved.ok) return saved;

  return { ok: true as const, date: isoDate, cart: saved.cart };
}

/**
 * The two-hour window, checked against the live slot table for the same reason
 * the date is checked against live availability: the picker's options are only
 * as fresh as the page they were rendered into, and a tab left open across a
 * change to the windows must not be able to book one that has been withdrawn.
 *
 * The *canonical* window is stored, not the id that arrived — so an order can
 * never carry a label the owners did not write.
 */
export async function setDeliverySlot(locale: Locale, slotId: string) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  // Collection times or delivery windows, by the cart's method.
  const cart = await getCart(locale);
  const method = cart?.deliveryMethod === "pickup" ? "pickup" : "delivery";
  const slots =
    method === "pickup" ? await getPickupSlots() : await getDeliverySlots();
  const slot = findSlot(slots, slotId);
  if (!slot) return orderFailure("slot_unavailable");

  // Full on the day the cart already holds. A cart with no day yet is let
  // through — there is nothing to count against — and checkout counts again.
  const deliveryDate = cart?.deliveryDate;
  if (deliveryDate) {
    const full = await getFullSlots(deliveryDate, slots, method);
    if (full.includes(slotAttributeValue(slot))) {
      return orderFailure("slot_unavailable");
    }
  }

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_SLOT_ATTRIBUTE]: slotAttributeValue(slot),
  });
  if (!saved.ok) return saved;

  return { ok: true as const, slot, cart: saved.cart };
}

/**
 * Trimmed and capped here, not only in the input: the value arrives from the
 * client as a string like any other, and this one is printed on a kitchen
 * ticket. An empty note clears the attribute rather than storing "".
 */
export async function setDeliveryNote(locale: Locale, value: string) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const note = value.trim().slice(0, DELIVERY_NOTE_MAX);

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_NOTE_ATTRIBUTE]: note || null,
  });
  if (!saved.ok) return saved;

  return { ok: true as const, note };
}

export async function setDeliveryMethod(locale: Locale, method: DeliveryMethod) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");
  if (!isDeliveryMethod(method)) return orderFailure("unknown_method");

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_METHOD_ATTRIBUTE]: deliveryMethodAttributeValue(method),
    // Click & collect leaves nothing to deliver to, so a previously saved
    // address is cleared rather than left on the order contradicting it — and
    // the zone with it, since a zone without an address prices nothing.
    // Delivery windows and collection times are different lists, so a slot
    // chosen under one method means nothing under the other.
    [DELIVERY_SLOT_ATTRIBUTE]: null,
    // Click & collect leaves nothing to deliver to, so a previously saved
    // address is cleared rather than left on the order contradicting it — and
    // the zone with it, since a zone without an address prices nothing.
    ...(method === "pickup"
      ? {
          [DELIVERY_ADDRESS_ATTRIBUTE]: null,
          [DELIVERY_ZONE_ATTRIBUTE]: null,
        }
      : {}),
  });
  if (!saved.ok) return saved;

  return { ok: true as const, method };
}

/**
 * Checked against the address register again here, for the same reason the date
 * is: the value arriving from the client is just a string, whether or not it
 * came from a suggestion the visitor clicked. The register's own spelling is
 * what gets stored.
 */
export async function setDeliveryAddress(locale: Locale, value: string) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  // A public endpoint that spends the Geoapify quota, so it gets the same
  // budget and length cap as /api/address — otherwise it is the cheaper way
  // around them.
  if (typeof value !== "string" || value.trim().length > MAX_ADDRESS_LENGTH) {
    return orderFailure("address_not_found");
  }
  if (!takeToken(`address-save:${clientAddress(await headers())}`, ADDRESS_SAVE_LIMIT)) {
    return orderFailure("too_many_requests");
  }

  const resolved = await resolveAddress(value);
  if (!resolved) return orderFailure("address_not_found");

  // Where it falls decides the fee and the minimum order, so it is resolved
  // once here and stored — the alternative is geocoding the label again on
  // every cart render just to know which zone it was.
  //
  // Against the live table, not the one the page was rendered with: a visitor
  // who left the tab open through a price change must be quoted today's fee.
  const zone = resolveDeliveryZone(await getZoneTable(), {
    postCode: resolved.postCode,
    coordinates: resolved.coordinates,
  });

  // Past the last band the client quotes by hand. Not a rejection: the address
  // is fine and the sale is real, it just cannot be priced on the site, so the
  // caller sends them to the quote form instead of saving a cart that can never
  // reach checkout.
  if (zone.kind === "quote") {
    // Whatever address was on the cart before is no longer where this order is
    // going. Left in place, the cart could still check out against it, priced
    // for somewhere the customer has just said they are not. Only an existing
    // cart is touched — this must not open one — and a failure here is not the
    // customer's to see: the quote form still works, and the checkout gate
    // still has the final word.
    if (await getCartIdFromCookies()) {
      const cleared = await saveOrderPreferences(locale, {
        [DELIVERY_ADDRESS_ATTRIBUTE]: null,
        [DELIVERY_ZONE_ATTRIBUTE]: null,
      });
      if (!cleared.ok) {
        console.error("[cart] could not clear the address after a quote");
      }
    }

    return {
      ok: false as const,
      needsQuote: true as const,
      address: resolved.label,
      distanceKm: Math.round(zone.distanceKm),
    };
  }

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_ADDRESS_ATTRIBUTE]: resolved.label,
    // An address only makes sense for delivery, so choosing one settles the
    // method too — otherwise the order carries a destination and no way to it.
    [DELIVERY_METHOD_ATTRIBUTE]: deliveryMethodAttributeValue("delivery"),
    [DELIVERY_ZONE_ATTRIBUTE]: formatZoneAttribute(zone.zone, zone.distanceKm),
  });
  if (!saved.ok) return saved;

  return {
    ok: true as const,
    address: resolved.label,
    zone: zone.zone,
    distanceKm: zone.distanceKm,
  };
}

/**
 * The updated cart travels back with the result so the caller can paint it
 * straight away. No `revalidatePath` here on purpose: the cart page re-reads the
 * cart on its own (it is dynamic, and `CartDeliverySection` calls
 * `router.refresh()` after its own writes), while revalidating from a Server
 * Function makes every previously visited page refetch on the next navigation —
 * a lot of work to hang off a quantity stepper.
 */
export async function updateCartLine(
  locale: Locale,
  lineId: string,
  quantity: number,
) {
  locale = toLocale(locale);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999) {
    return orderFailure("cart_failed");
  }

  const cartId = await getCartIdFromCookies();
  if (!cartId) return orderFailure("no_cart");

  const result = await updateCartLineQuantity(locale, cartId, lineId, quantity);
  if (!result.ok) return orderFailure("cart_failed");

  return { ok: true as const, cart: result.cart };
}

export async function removeFromCart(locale: Locale, lineId: string) {
  locale = toLocale(locale);
  const cartId = await getCartIdFromCookies();
  if (!cartId) return orderFailure("no_cart");

  const result = await removeCartLines(locale, cartId, [lineId]);
  if (!result.ok) return orderFailure("cart_failed");

  return { ok: true as const, cart: result.cart };
}

/**
 * The only way to Shopify's checkout.
 *
 * The cart page and the panel both decide whether to draw a Checkout button,
 * but they decide it from rules loaded when the page was — and the page can be
 * hours old. So the button asks here, and this reads the cart and the rules
 * afresh: a basket that fell below its zone's minimum, a date that slipped past
 * the 16:00 cut-off, a window the owners withdrew, all stop here instead of
 * reaching an order.
 *
 * A refusal does not say which rule. The caller re-reads the cart, and the
 * blocker it then computes from fresh data is the instruction the customer
 * sees — the same wording they would have seen had the page been current.
 *
 * What this cannot do is stop someone who reaches Shopify another way, or who
 * changes the address or adds a discount on Shopify's own pages. That needs a
 * Cart & Checkout Validation Function running inside Shopify — see docs/dev-notes.md.
 */
/** GA ids look like `123456789.1700000000` and `1700000000`; nothing else is stored. */
const GA_ID_PATTERN = /^[0-9.]{1,40}$/;

export async function beginCheckout(
  locale: Locale,
  analytics: { clientId: string; sessionId: string | null } | null = null,
) {
  locale = toLocale(locale);
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const cartId = await getCartIdFromCookies();
  if (!cartId) return orderFailure("no_cart");

  const [lookup, rules] = await Promise.all([
    lookupCart(locale, cartId),
    getDeliveryRules(),
  ]);

  if (lookup.kind === "missing") {
    await clearCartCookie();
    return orderFailure("no_cart");
  }
  if (lookup.kind === "error") return orderFailure("cart_failed");

  const { cart, checkoutUrl } = lookup;
  if (cart.totalQuantity === 0) return orderFailure("no_cart");

  if (rules.availability.closuresUnavailable) {
    return orderFailure("rules_unavailable");
  }

  // Counted last and live: this is the moment two customers racing for the
  // last place in a window are separated. It cannot close the race entirely —
  // both can be on Shopify's payment page at once — but it narrows it to the
  // minutes a payment takes.
  const method = cart.deliveryMethod === "pickup" ? "pickup" : "delivery";
  const fullSlots = cart.deliveryDate
    ? await getFullSlots(
        cart.deliveryDate,
        method === "pickup" ? rules.pickupSlots : rules.slots,
        method,
      )
    : [];

  const blocker = checkoutBlocker(
    cart,
    rules.availability,
    rules.zones,
    rules.slots,
    fullSlots,
    rules.pickupSlots,
  );
  if (blocker) return orderFailure("checkout_changed");

  // The visitor's GA ids ride to Shopify's checkout on the cart, where the
  // custom pixel reads them to send the purchase as the same visitor. Written
  // — or cleared — on every checkout, so a visitor who withdrew consent since
  // the last attempt leaves nothing behind for the pixel to use. Best effort:
  // analytics never blocks a sale.
  const clientId =
    analytics && GA_ID_PATTERN.test(analytics.clientId) ? analytics.clientId : null;
  const sessionId =
    clientId && analytics?.sessionId && GA_ID_PATTERN.test(analytics.sessionId)
      ? analytics.sessionId
      : null;
  await setCartAttributes(
    locale,
    { [GA_CLIENT_ID_ATTRIBUTE]: clientId, [GA_SESSION_ID_ATTRIBUTE]: sessionId },
    cartId,
  ).catch(() => null);

  return {
    ok: true as const,
    url: checkoutUrl,
    // For the `begin_checkout` event, from the cart just re-read rather than
    // whatever the page last painted.
    value: cart.subtotal,
    items: cart.lines.map((line) => ({
      item_id: line.productHandle,
      item_name: line.title,
      price: line.unitPrice,
      quantity: line.quantity,
    })),
  };
}
