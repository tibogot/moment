/**
 * Address lookup against UrbIS, the Brussels-Capital Region's own address
 * register (https://geoservices.irisnet.be/localization/). It is free, needs no
 * key or account, carries both the French and Dutch notation of every street,
 * and is rebuilt once a day.
 *
 * Its role changed when the delivery area did. It used to be the only lookup
 * and doubled as the delivery-area gate, because the register stops at the
 * regional border. Now that the zone table quotes fees out to 50km, that border
 * is the wrong boundary and `geoapify.ts` is the provider in front. UrbIS stays
 * as the fallback for when no API key is configured: Brussels is zone 1 and the
 * bulk of the orders, so a keyless deployment still takes those rather than
 * refusing every address.
 *
 * The one thing you must know about this service: it never says no. It is a
 * fuzzy matcher, so `Grote Markt 1, 1500 Halle` — a real address, but outside
 * the region — comes back as `Rue de Danemark, Saint-Gilles` with a score of
 * 17, and a street that does not exist at all still returns the nearest thing it
 * can find. The presence of a result therefore means nothing.
 *
 * `qualificationCode` is the only honest signal. A match counts only when both
 * the street and the house number came back "1" (found), which is what rejects
 * a misspelt street, a missing house number, and `Rue de Stalle, 99999` alike.
 */

import {
  formatAddress,
  MAX_SUGGESTIONS,
  type AddressMatch,
  type AddressProvider,
  type AddressSearch,
} from "./provider";
import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/order-preferences";

const URBIS_ENDPOINT =
  "https://geoservices.irisnet.be/localization/Rest/Localize/getaddresses";

/** WGS84, which is what makes `point` usable as a distance origin. */
const SPATIAL_REFERENCE = "4326";

/** UrbIS grades each part of a match; "1" is the only value meaning "found". */
const FOUND = "1";

const REQUEST_TIMEOUT_MS = 5000;

/** The register is rebuilt daily, so a day-old answer is still the right one. */
const REVALIDATE_SECONDS = 60 * 60 * 24;

type UrbisResult = {
  address?: {
    number?: string;
    street?: { name?: string; postCode?: string; municipality?: string };
  };
  adNc?: string;
  score?: number;
  /** Longitude in `x`, latitude in `y` — not the other way round. */
  point?: { x?: number; y?: number };
  qualificationCode?: {
    policeNumber?: string;
    postCode?: string;
    municipality?: string;
    streetName?: string;
  };
};

type UrbisResponse = { result?: UrbisResult[]; error?: boolean };

/** Never throws: the address field degrades to "we cannot check that right now". */
async function queryUrbis(
  address: string,
  language: "fr" | "nl",
): Promise<UrbisResult[]> {
  const url =
    `${URBIS_ENDPOINT}?spatialReference=${SPATIAL_REFERENCE}` +
    `&language=${language}&address=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error(`[urbis] lookup returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as UrbisResponse;
    if (data.error) return [];

    return data.result ?? [];
  } catch (error) {
    console.error("[urbis] lookup failed", error);
    return [];
  }
}

function isComplete(result: UrbisResult) {
  return (
    result.qualificationCode?.streetName === FOUND &&
    result.qualificationCode?.policeNumber === FOUND
  );
}

function toMatch(result: UrbisResult): AddressMatch | null {
  const street = result.address?.street?.name?.trim();
  const number = result.address?.number?.trim();
  const postCode = result.address?.street?.postCode?.trim();
  const municipality = result.address?.street?.municipality?.trim();
  const longitude = result.point?.x;
  const latitude = result.point?.y;

  if (!street || !number || !postCode || !municipality) return null;
  // Without a point the address cannot be priced, so it is not a usable match
  // even though the register recognised it.
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;

  const parts = { street, number, postCode, municipality };

  return {
    id: result.adNc?.trim() || formatAddress(parts),
    label: formatAddress(parts),
    ...parts,
    coordinates: { latitude, longitude },
  };
}

async function search(input: string): Promise<AddressSearch> {
  const trimmed = input.trim();
  if (trimmed.length < MIN_ADDRESS_QUERY_LENGTH) {
    return { matches: [], streets: [] };
  }

  // Brussels is bilingual and the register stores both notations, so someone
  // typing "Stallestraat" and someone typing "Rue de Stalle" both have to land.
  // Each notation only scores well against its own language, so both are asked
  // and the better score wins — which is, conveniently, the language the
  // visitor was typing in.
  const [french, dutch] = await Promise.all([
    queryUrbis(trimmed, "fr"),
    queryUrbis(trimmed, "nl"),
  ]);

  const ranked = [...french, ...dutch].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  );

  const matches: AddressMatch[] = [];
  const seen = new Set<string>();
  const streets = new Set<string>();

  for (const result of ranked) {
    if (!isComplete(result)) {
      // A recognised street with no number is worth surfacing: the visitor is
      // one house number from a valid address.
      const name = result.address?.street?.name?.trim();
      if (name && result.qualificationCode?.streetName === FOUND) {
        streets.add(name);
      }
      continue;
    }

    const match = toMatch(result);
    // Both languages describe the same address point, so dedupe on the id.
    if (!match || seen.has(match.id)) continue;

    seen.add(match.id);
    matches.push(match);
    if (matches.length === MAX_SUGGESTIONS) break;
  }

  return {
    matches,
    // Only a hint when there is nothing better to offer.
    streets: matches.length > 0 ? [] : [...streets].slice(0, MAX_SUGGESTIONS),
  };
}

async function resolve(value: string): Promise<AddressMatch | null> {
  const { matches } = await search(value);
  if (matches.length === 0) return null;

  // An exact echo of a suggestion is the normal path. Anything else was typed
  // freehand, and takes the best verified match so the order carries the
  // register's spelling rather than the customer's.
  return matches.find((match) => match.label === value) ?? matches[0];
}

export const urbisProvider: AddressProvider = {
  name: "urbis",
  search,
  resolve,
};
