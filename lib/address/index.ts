/**
 * Picks the address provider and is the only thing the rest of the app imports.
 *
 * Geoapify when a key is configured, UrbIS when it is not. The fallback is not
 * a courtesy to local development: a missing or expired key in production would
 * otherwise take the whole delivery flow down, and Brussels — zone 1, and most
 * of the orders — can still be served by a register that needs no key at all.
 * What is lost in that state is everything outside the region, which the cart
 * surfaces as "we could not find that address" rather than pretending.
 */

import { geoapifyProvider, isGeoapifyConfigured } from "./geoapify";
import { urbisProvider } from "./urbis";
import type { AddressProvider } from "./provider";

export type {
  AddressMatch,
  AddressProvider,
  AddressSearch,
} from "./provider";
export { formatAddress, MAX_SUGGESTIONS } from "./provider";

export function getAddressProvider(): AddressProvider {
  return isGeoapifyConfigured() ? geoapifyProvider : urbisProvider;
}

/** Whether the lookup can currently see past the Brussels regional border. */
export function coversAllOfBelgium() {
  return isGeoapifyConfigured();
}

export function searchAddresses(query: string) {
  return getAddressProvider().search(query);
}

export function resolveAddress(value: string) {
  return getAddressProvider().resolve(value);
}
