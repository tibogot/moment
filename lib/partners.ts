/**
 * The partners the "Où nous trouver" map shows, with a point for each.
 *
 * The owners type an address in the Studio; this turns it into coordinates
 * through the same lookup the delivery zones use (Geoapify, UrbIS as the
 * Brussels fallback), so nobody ever has to find a latitude. A point they set
 * by hand in the Studio wins — that field exists for the address the lookup
 * gets wrong.
 *
 * Geocoding is cached per address for a month: an address does not move, the
 * free Geoapify tier is 3,000 lookups a day, and a map that re-geocodes every
 * partner on every rebuild would spend it for nothing. Editing the address is a
 * new cache key, so a correction shows on the next rebuild.
 */

import { unstable_cache } from "next/cache";
import { resolveAddress } from "@/lib/address";
import type { Coordinates } from "@/lib/delivery-zones";
import { getPartnerDocuments } from "@/lib/sanity/queries";

export type PartnerKind =
  | "cafe"
  | "restaurant"
  | "shop"
  | "hotel"
  | "office"
  | "other";

export type Partner = {
  id: string;
  name: string;
  kind: PartnerKind;
  /** One line, as printed: "Chaussée de Waterloo 123, 1180 Uccle". */
  address: string;
  url: string | null;
  /** Null when the address could not be placed — listed, but not on the map. */
  coordinates: Coordinates | null;
};

const PARTNER_KINDS: readonly PartnerKind[] = [
  "cafe",
  "restaurant",
  "shop",
  "hotel",
  "office",
  "other",
];

const GEOCODE_CACHE_SECONDS = 60 * 60 * 24 * 30;

const geocode = unstable_cache(
  async (address: string): Promise<Coordinates | null> => {
    try {
      return (await resolveAddress(address))?.coordinates ?? null;
    } catch (error) {
      console.error("[partners] could not place", address, error);
      return null;
    }
  },
  ["partner-geocode"],
  { revalidate: GEOCODE_CACHE_SECONDS },
);

export async function getPartners(): Promise<Partner[]> {
  const documents = await getPartnerDocuments();

  return Promise.all(
    documents.flatMap((doc) => {
      if (!doc.name || !doc.street || !doc.postalCode || !doc.city) return [];

      const address = `${doc.street.trim()}, ${doc.postalCode.trim()} ${doc.city.trim()}`;
      const kind = PARTNER_KINDS.includes(doc.kind as PartnerKind)
        ? (doc.kind as PartnerKind)
        : "other";
      const manual =
        typeof doc.location?.lat === "number" &&
        typeof doc.location?.lng === "number"
          ? { latitude: doc.location.lat, longitude: doc.location.lng }
          : null;

      return [
        (async (): Promise<Partner> => ({
          id: doc._id,
          name: doc.name!.trim(),
          kind,
          address,
          url: doc.url ?? null,
          coordinates: manual ?? (await geocode(address)),
        }))(),
      ];
    }),
  );
}
