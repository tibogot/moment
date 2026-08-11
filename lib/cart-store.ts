// Client-side cart store shared by the navbar badge and the cart panel.
// Fetches once on first subscription, deduplicates in-flight requests, and
// refreshes whenever a `cart-updated` event fires.

import type { DeliveryAvailability } from "@/lib/delivery";
import { DEFAULT_ZONE_TABLE, type ZoneTable } from "@/lib/delivery-zones";
import type { Cart } from "@/lib/shopify/cart";

let cart: Cart | null = null;
let availability: DeliveryAvailability | null = null;
/**
 * Unlike the cart and the availability, this is never null: a fee line has to
 * be able to render before the first fetch lands, and the built-in table is the
 * same one the server falls back to. It is replaced, not filled in.
 */
let zones: ZoneTable = DEFAULT_ZONE_TABLE;
let hasFetched = false;
let inFlight: Promise<void> | null = null;
let refetchQueued = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function fetchCart(): Promise<void> {
  // A request asked for while one is already running has to be honoured after
  // it settles, not folded into it: the in-flight response was sent before the
  // mutation that prompted this call, so reusing it would leave the panel a
  // change behind until something else happened to refresh it.
  if (inFlight) {
    refetchQueued = true;
    return inFlight;
  }

  inFlight = (async () => {
    try {
      // The language is read off the URL rather than passed in: this store is
      // a module shared by the navbar, the panel and the preferences bar, and
      // none of them owns the locale. The path always does.
      const lang = window.location.pathname.split("/")[1] || "";
      const response = await fetch(`/api/cart?lang=${encodeURIComponent(lang)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        cart = null;
        return;
      }

      const data = (await response.json()) as {
        cart: Cart | null;
        availability: DeliveryAvailability | null;
        zones?: ZoneTable;
      };
      cart = data.cart;
      availability = data.availability;
      if (data.zones) zones = data.zones;
    } catch {
      // Keep the last known cart on network errors.
    } finally {
      hasFetched = true;
      inFlight = null;
      emit();

      if (refetchQueued) {
        refetchQueued = false;
        void fetchCart();
      }
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

/**
 * The zone table, for the fee and minimum-order lines.
 *
 * Same reasoning as availability — its own subscription rather than folded into
 * the cart snapshot — and the same on both sides of hydration, since the
 * built-in table is what the server renders with until a shop configures one.
 */
export function getZonesSnapshot(): ZoneTable {
  return zones;
}

export function refreshCart(): Promise<void> {
  return fetchCart();
}

/**
 * Publishes a cart a mutation just handed back, skipping the round trip that
 * `notifyCartUpdated` would cost. `hasFetched` is deliberately left alone: it
 * gates the first `/api/cart` call, which is also the only thing that loads
 * availability, and the panel's date picker needs that.
 */
export function setCart(next: Cart | null) {
  cart = next;
  emit();
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
