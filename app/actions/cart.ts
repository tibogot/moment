"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addVariantToCart,
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
} from "@/lib/shopify/delivery";
import { getDeliveryRules, getZoneTable } from "@/lib/shopify/zones";
import { checkoutBlocker } from "@/lib/checkout";
import type { Locale } from "@/lib/i18n/config";
import { resolveAddress } from "@/lib/address";
import { DELIVERY_DATE_ATTRIBUTE, isBookable } from "@/lib/delivery";
import {
  DELIVERY_SLOT_ATTRIBUTE,
  findSlot,
  slotAttributeValue,
} from "@/lib/delivery-slots";
import {
  DELIVERY_ZONE_ATTRIBUTE,
  formatZoneAttribute,
  resolveDeliveryZone,
} from "@/lib/delivery-zones";
import {
  DELIVERY_ADDRESS_ATTRIBUTE,
  DELIVERY_METHOD_ATTRIBUTE,
  DELIVERY_NOTE_ATTRIBUTE,
  DELIVERY_NOTE_MAX,
  deliveryMethodAttributeValue,
  isDeliveryMethod,
  type DeliveryMethod,
} from "@/lib/order-preferences";
import { orderFailure } from "@/lib/order-errors";
import { routes } from "@/lib/routes";

async function getCartIdFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(getCartCookieOptions().name)?.value;
}

async function setCartCookie(cartId: string) {
  const cookieStore = await cookies();
  const options = getCartCookieOptions();
  cookieStore.set(options.name, cartId, options);
}

async function clearCartCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(getCartCookieOptions().name);
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
  if (!isShopifyConfigured()) return orderFailure("not_configured");

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
  revalidatePath(routes.cart);

  return {
    ok: true as const,
    totalQuantity: result.totalQuantity,
    cart: result.cart,
  };
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
  revalidatePath(routes.cart);

  return { ok: true as const, cart: result.cart };
}

/**
 * The calendar's own paint job is only as fresh as the page it was rendered
 * into, so the rules are checked again here against live availability. A page
 * left open overnight, or one served from the static shell, cannot book a day
 * the owners have since closed.
 */
export async function setDeliveryDate(locale: Locale, isoDate: string) {
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const availability = await getDeliveryAvailability();
  if (availability.closuresUnavailable) {
    return orderFailure("rules_unavailable");
  }
  if (!isBookable(isoDate, availability)) {
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
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const slot = findSlot(await getDeliverySlots(), slotId);
  if (!slot) return orderFailure("slot_unavailable");

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
  if (!isShopifyConfigured()) return orderFailure("not_configured");

  const note = value.trim().slice(0, DELIVERY_NOTE_MAX);

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_NOTE_ATTRIBUTE]: note || null,
  });
  if (!saved.ok) return saved;

  return { ok: true as const, note };
}

export async function setDeliveryMethod(locale: Locale, method: DeliveryMethod) {
  if (!isShopifyConfigured()) return orderFailure("not_configured");
  if (!isDeliveryMethod(method)) return orderFailure("unknown_method");

  const saved = await saveOrderPreferences(locale, {
    [DELIVERY_METHOD_ATTRIBUTE]: deliveryMethodAttributeValue(method),
    // Click & collect leaves nothing to deliver to, so a previously saved
    // address is cleared rather than left on the order contradicting it — and
    // the zone with it, since a zone without an address prices nothing.
    ...(method === "pickup"
      ? {
          [DELIVERY_ADDRESS_ATTRIBUTE]: null,
          [DELIVERY_ZONE_ATTRIBUTE]: null,
          // Collection is one long opening, not a booked window. Leaving a
          // delivery slot on the order would tell the kitchen to have it at the
          // door at 09:00 for someone who is coming to fetch it at 15:00.
          [DELIVERY_SLOT_ATTRIBUTE]: null,
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
  if (!isShopifyConfigured()) return orderFailure("not_configured");

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
 * Cart & Checkout Validation Function running inside Shopify — see TODO.md.
 */
export async function beginCheckout(locale: Locale) {
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

  const blocker = checkoutBlocker(
    cart,
    rules.availability,
    rules.zones,
    rules.slots,
  );
  if (blocker) return orderFailure("checkout_changed");

  return { ok: true as const, url: checkoutUrl };
}
