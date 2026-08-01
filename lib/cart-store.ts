// Client-side cart store shared by the navbar badge and the cart panel.
// Fetches once on first subscription, deduplicates in-flight requests, and
// refreshes whenever a `cart-updated` event fires.

import type { DeliveryAvailability } from "@/lib/delivery";
import type { Cart } from "@/lib/shopify/cart";

let cart: Cart | null = null;
let availability: DeliveryAvailability | null = null;
let hasFetched = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function fetchCart(): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) {
        cart = null;
        return;
      }

      const data = (await response.json()) as {
        cart: Cart | null;
        availability: DeliveryAvailability | null;
      };
      cart = data.cart;
      availability = data.availability;
    } catch {
      // Keep the last known cart on network errors.
    } finally {
      hasFetched = true;
      inFlight = null;
      emit();
    }
  })();

  return inFlight;
}

export function subscribeCart(callback: () => void): () => void {
  listeners.add(callback);
  if (!hasFetched && !inFlight) void fetchCart();
  return () => listeners.delete(callback);
}

export function getCartSnapshot(): Cart | null {
  return cart;
}

export function getServerCartSnapshot(): Cart | null {
  return null;
}

/**
 * Kept as its own subscription rather than folded into the cart snapshot: the
 * navbar badge only wants the cart, and bundling the two into an object would
 * hand `useSyncExternalStore` a fresh reference on every read.
 */
export function getAvailabilitySnapshot(): DeliveryAvailability | null {
  return availability;
}

export function getServerAvailabilitySnapshot(): DeliveryAvailability | null {
  return null;
}

export function refreshCart(): Promise<void> {
  return fetchCart();
}

/** Fire after any mutation so the badge and panel re-read the cart. */
export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}

if (typeof window !== "undefined") {
  window.addEventListener("cart-updated", () => {
    void fetchCart();
  });
}
