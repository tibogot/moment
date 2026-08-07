"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addVariantToCart,
  getCartById,
  getCartCookieOptions,
  removeCartLines,
  setCartAttributes,
  updateCartLineQuantity,
} from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";
import { resolveAddress } from "@/lib/address";
import { DELIVERY_DATE_ATTRIBUTE, isBookable } from "@/lib/delivery";
import {
  DELIVERY_ZONE_ATTRIBUTE,
  formatZoneAttribute,
  MAX_DELIVERY_DISTANCE_KM,
  resolveDeliveryZone,
} from "@/lib/delivery-zones";
import {
  DELIVERY_ADDRESS_ATTRIBUTE,
  DELIVERY_METHOD_ATTRIBUTE,
  deliveryMethodAttributeValue,
  isDeliveryMethod,
  type DeliveryMethod,
} from "@/lib/order-preferences";
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

export async function getCart() {
  if (!isShopifyConfigured()) return null;

  const cartId = await getCartIdFromCookies();
  if (!cartId) return null;

  const cart = await getCartById(cartId);
  if (!cart) {
    await clearCartCookie();
    return null;
  }

  return cart;
}

export async function addToCart(variantId: string, quantity = 1) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  const existingCartId = await getCartIdFromCookies();
  let result = await addVariantToCart(variantId, quantity, existingCartId);

  // A stale cart id (expired or already completed) makes cartLinesAdd fail —
  // drop the cookie and start a fresh cart rather than surfacing the error.
  if (!result.ok && existingCartId) {
    await clearCartCookie();
    result = await addVariantToCart(variantId, quantity);
  }

  if (!result.ok) return result;

  await setCartCookie(result.cartId);
  revalidatePath(routes.cart);

  return { ok: true as const, totalQuantity: result.totalQuantity, cart: result.cart };
}

/**
 * Merges a patch of order preferences onto the cart, with the same stale-cart
 * recovery as addToCart: an expired or completed cart id fails the update, so
 * drop the cookie and open a fresh one.
 */
async function saveOrderPreferences(patch: Record<string, string | null>) {
  const existingCartId = await getCartIdFromCookies();
  let result = await setCartAttributes(patch, existingCartId);

  if (!result.ok && existingCartId) {
    await clearCartCookie();
    result = await setCartAttributes(patch);
  }

  if (!result.ok) return result;

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
export async function setDeliveryDate(isoDate: string) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  const availability = await getDeliveryAvailability();
  if (!isBookable(isoDate, availability)) {
    return {
      ok: false as const,
      error: "That day is no longer available. Please pick another.",
    };
  }

  const saved = await saveOrderPreferences({
    [DELIVERY_DATE_ATTRIBUTE]: isoDate,
  });
  if (!saved.ok) return saved;

  return { ok: true as const, date: isoDate, cart: saved.cart };
}

export async function setDeliveryMethod(method: DeliveryMethod) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  if (!isDeliveryMethod(method)) {
    return { ok: false as const, error: "Unknown delivery option." };
  }

  const saved = await saveOrderPreferences({
    [DELIVERY_METHOD_ATTRIBUTE]: deliveryMethodAttributeValue(method),
    // Click & collect leaves nothing to deliver to, so a previously saved
    // address is cleared rather than left on the order contradicting it — and
    // the zone with it, since a zone without an address prices nothing.
    ...(method === "pickup"
      ? { [DELIVERY_ADDRESS_ATTRIBUTE]: null, [DELIVERY_ZONE_ATTRIBUTE]: null }
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
export async function setDeliveryAddress(value: string) {
  if (!isShopifyConfigured()) {
    return { ok: false as const, error: "The shop is not configured." };
  }

  const resolved = await resolveAddress(value);
  if (!resolved) {
    return {
      ok: false as const,
      error:
        "We could not find that address in Belgium. Check the street name and house number.",
    };
  }

  // Where it falls decides the fee and the minimum order, so it is resolved
  // once here and stored — the alternative is geocoding the label again on
  // every cart render just to know which zone it was.
  const zone = resolveDeliveryZone({
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
      distanceKm: zone.distanceKm,
      error: `${resolved.label} is ${zone.distanceKm.toFixed(0)} km from the atelier, past the ${MAX_DELIVERY_DISTANCE_KM} km we deliver to directly. We will quote this one by hand.`,
    };
  }

  const saved = await saveOrderPreferences({
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
export async function updateCartLine(lineId: string, quantity: number) {
  const cartId = await getCartIdFromCookies();
  if (!cartId) return { ok: false as const, error: "No cart found." };

  const result = await updateCartLineQuantity(cartId, lineId, quantity);
  if (!result.ok) return result;

  return { ok: true as const, cart: result.cart };
}

export async function removeFromCart(lineId: string) {
  const cartId = await getCartIdFromCookies();
  if (!cartId) return { ok: false as const, error: "No cart found." };

  const result = await removeCartLines(cartId, [lineId]);
  if (!result.ok) return result;

  return { ok: true as const, cart: result.cart };
}
