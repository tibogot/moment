"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addVariantToCart,
  getCartById,
  getCartCookieOptions,
  removeCartLines,
  setCartDeliveryDate,
  updateCartLineQuantity,
} from "@/lib/shopify/cart";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";
import { isBookable } from "@/lib/delivery";
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

  return { ok: true as const, totalQuantity: result.totalQuantity };
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

  const existingCartId = await getCartIdFromCookies();
  let result = await setCartDeliveryDate(isoDate, existingCartId);

  // Same stale-cart recovery as addToCart: an expired or completed cart id
  // fails the update, so drop the cookie and open a fresh one.
  if (!result.ok && existingCartId) {
    await clearCartCookie();
    result = await setCartDeliveryDate(isoDate);
  }

  if (!result.ok) return result;

  await setCartCookie(result.cartId);
  revalidatePath(routes.cart);

  return { ok: true as const, date: isoDate };
}

export async function updateCartLine(lineId: string, quantity: number) {
  const cartId = await getCartIdFromCookies();
  if (!cartId) return { ok: false as const, error: "No cart found." };

  const result = await updateCartLineQuantity(cartId, lineId, quantity);
  if (!result.ok) return result;

  revalidatePath(routes.cart);
  return { ok: true as const, totalQuantity: result.totalQuantity };
}

export async function removeFromCart(lineId: string) {
  const cartId = await getCartIdFromCookies();
  if (!cartId) return { ok: false as const, error: "No cart found." };

  const result = await removeCartLines(cartId, [lineId]);
  if (!result.ok) return result;

  revalidatePath(routes.cart);
  return { ok: true as const, totalQuantity: result.totalQuantity };
}
