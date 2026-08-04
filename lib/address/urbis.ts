/**
 * Address lookup against UrbIS, the Brussels-Capital Region's own address
 * register (https://geoservices.irisnet.be/localization/). It is free, needs no
 * key or account, carries both the French and Dutch notation of every street,
 * and is rebuilt once a day.
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
 *
 * Because the register stops at the regional border, that same check is what
 * keeps orders inside the delivery area.
 */

import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/order-preferences";

const URBIS_ENDPOINT =
  "https://geoservices.irisnet.be/localization/Rest/Localize/getaddresses";

/** WGS84. We do not use the coordinates, but the service demands the parameter. */
const SPATIAL_REFERENCE = "4326";

/** UrbIS grades each part of a match; "1" is the only value meaning "found". */
const FOUND = "1";

const REQUEST_TIMEOUT_MS = 5000;

/** The register is rebuilt daily, so a day-old answer is still the right one. */
const REVALIDATE_SECONDS = 60 * 60 * 24;

const MAX_SUGGESTIONS = 6;

type UrbisResult = {
  address?: {
    number?: string;
    street?: { name?: string; postCode?: string; municipality?: string };
  };
  adNc?: string;
  score?: number;
  qualificationCode?: {
    policeNumber?: string;
    postCode?: string;
    municipality?: string;
    streetName?: string;
  };
};

type UrbisResponse = { result?: UrbisResult[]; error?: boolean };

export type AddressMatch = {
  /** UrbIS' own identifier for the address point. */
  id: string;
  /** The canonical one-line form — this is what gets written onto the cart. */
  label: string;
  street: string;
  number: string;
  postCode: string;
  municipality: string;
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

export function formatAddress(parts: {
  street: string;
  number: string;
  postCode: string;
  municipality: string;
}) {
  return `${parts.street} ${parts.number}, ${parts.postCode} ${parts.municipality}`;
}

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

  if (!street || !number || !postCode || !municipality) return null;

  const parts = { street, number, postCode, municipality };

  return {
    id: result.adNc?.trim() || formatAddress(parts),
    label: formatAddress(parts),
    ...parts,
  };
}

export async function searchAddresses(query: string): Promise<AddressSearch> {
  const trimmed = query.trim();
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

/**
 * Re-checks an address the client claims to have picked, and returns it in
 * canonical form. The counterpart of `isBookable` for dates: what arrives at a
 * server action is just a string in a form post, so the client's word is never
 * enough on its own.
 */
export async function resolveAddress(
  value: string,
): Promise<AddressMatch | null> {
  const { matches } = await searchAddresses(value);
  if (matches.length === 0) return null;

  // An exact echo of a suggestion is the normal path. Anything else was typed
  // freehand, and takes the best verified match so the order carries the
  // register's spelling rather than the customer's.
  return matches.find((match) => match.label === value) ?? matches[0];
}
