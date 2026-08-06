/**
 * The shape every address lookup has to speak, and the contract behind which
 * they are interchangeable.
 *
 * This exists because the delivery area outgrew the register the site started
 * with. UrbIS stops at the Brussels regional border, and the zone table now
 * quotes fees out to 50km — which crosses into Flanders and Wallonia, each with
 * its own register and neither with a free national one that covers the others.
 * Rather than teach the cart about three services, the cart knows about this
 * interface and one module decides who implements it.
 *
 * Nothing here touches Shopify or `next/*`, so the client panel can import the
 * types without pulling a provider into the browser bundle.
 */

import type { Coordinates } from "@/lib/delivery-zones";

export type AddressMatch = {
  /** The provider's own identifier for the address point. */
  id: string;
  /** The canonical one-line form — this is what gets written onto the cart. */
  label: string;
  street: string;
  number: string;
  postCode: string;
  municipality: string;
  /**
   * WGS84. Not decoration: every zone past Brussels is a distance from the
   * atelier, so an address without coordinates cannot be priced.
   */
  coordinates: Coordinates;
};

export type AddressSearch = {
  /** Complete, verified addresses the visitor can pick. */
  matches: AddressMatch[];
  /**
   * Streets that were recognised but had no usable house number. Kept apart
   * from `matches` so the overlay can say "add a house number" rather than
   * showing an empty list to someone who is one keystroke away.
   */
  streets: string[];
};

export type AddressProvider = {
  /** Named so a failure can be attributed in the logs. */
  readonly name: string;
  search(query: string): Promise<AddressSearch>;
  /**
   * Re-checks an address the client claims to have picked and returns it in
   * canonical form. The counterpart of `isBookable` for dates: what arrives at
   * a server action is just a string in a form post, so the client's word is
   * never enough on its own.
   */
  resolve(value: string): Promise<AddressMatch | null>;
};

/** Suggestions past this are noise, and the panel cannot show them anyway. */
export const MAX_SUGGESTIONS = 6;

/**
 * The one-line form, shared by every provider on purpose: the punctuation and
 * field order of a stored address should not depend on who looked it up.
 *
 * `resolve` matches a stored value against a freshly searched one by string
 * equality, and a stored value outlives the cart cookie by fourteen days. Both
 * providers normalise bilingual Brussels names to the French notation for that
 * reason, so the same door is the same string whichever one answered and
 * whichever language the visitor typed in.
 *
 * Do not lean on it harder than that. The exact match is a fast path, and
 * `resolve` falls back to the best verified result precisely because a label is
 * a human-readable convenience. Anything that has to be *correct* about an
 * address reads the postcode and the coordinates instead — those agree across
 * providers and across languages, which is why the zone lookup is built on them
 * and not on this.
 */
export function formatAddress(parts: {
  street: string;
  number: string;
  postCode: string;
  municipality: string;
}) {
  return `${parts.street} ${parts.number}, ${parts.postCode} ${parts.municipality}`;
}
