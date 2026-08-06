/**
 * Belgium-wide address lookup through Geoapify.
 *
 * Chosen over the official registers because there is no free national one:
 * UrbIS covers Brussels, `basisregisters.vlaanderen.be` covers Flanders, and
 * Wallonia — which holds Waterloo, Braine-l'Alleud, Wavre and Nivelles, all
 * inside the 50km quote radius — has no free equivalent. One provider for the
 * whole country beats stitching three together and reconciling their spellings.
 *
 * The free tier is 3,000 requests a day. That is not a real constraint here
 * because the route in front of this caches on Next's fetch cache for a day, so
 * the quota is spent on distinct queries rather than on keystrokes.
 */

import {
  formatAddress,
  MAX_SUGGESTIONS,
  type AddressMatch,
  type AddressProvider,
  type AddressSearch,
} from "./provider";
import { ATELIER } from "@/lib/delivery-zones";
import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/order-preferences";

const GEOAPIFY_ENDPOINT = "https://api.geoapify.com/v1/geocode/autocomplete";

const REQUEST_TIMEOUT_MS = 5000;

/** Addresses do not move. A day-old answer is still the right one. */
const REVALIDATE_SECONDS = 60 * 60 * 24;

const EMPTY: AddressSearch = { matches: [], streets: [] };

type GeoapifyProperties = {
  country_code?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  lon?: number;
  lat?: number;
  place_id?: string;
  result_type?: string;
};

type GeoapifyResponse = {
  features?: { properties?: GeoapifyProperties }[];
};

export function isGeoapifyConfigured() {
  return Boolean(process.env.GEOAPIFY_API_KEY);
}

function getApiKey() {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) throw new Error("GEOAPIFY_API_KEY is not configured.");
  return key;
}

/**
 * Geoapify labels the locality differently depending on how the place is
 * administered — a Brussels commune comes back as `city`, a village in Flemish
 * Brabant as `village` or `municipality`. They are the same field to us.
 */
function localityOf(properties: GeoapifyProperties) {
  return (
    properties.city ??
    properties.town ??
    properties.village ??
    properties.municipality ??
    null
  );
}

/**
 * Brussels is officially bilingual, and OpenStreetMap's convention for the
 * region is to carry both notations in one name, French first: `Rue de Stalle -
 * Stallestraat`, `Uccle - Ukkel`. Unsplit, that lands on the order sheet twice.
 *
 * Taking the first half rather than asking Geoapify for `lang=fr` is deliberate,
 * and it wins on three counts. It leaves Flanders and Wallonia alone, where the
 * names are already monolingual and postally correct — `lang=fr` rewrote Halle
 * to "Hal" and Leuven to "Louvain", which is defensible French and the wrong
 * thing to print on a delivery label. It gives Brussels the French notation,
 * which is what the site and the kitchen use, and which matches UrbIS
 * character for character. And it is stable: with `lang` set, Geoapify echoed
 * back whichever notation the visitor's query matched, so the same door came
 * out as "Rue de Stalle" or "Stallestraat" depending on how it was searched.
 *
 * The separator is " - " with spaces. Belgian names hyphenate without them
 * (Sint-Pieters-Leeuw, Braine-l'Alleud), so this does not bisect them.
 */
function primaryNotation(value: string) {
  return value.split(" - ")[0].trim();
}

/**
 * The equivalent of UrbIS' `qualificationCode` check: a result only counts when
 * it names an actual front door. Geoapify, like every geocoder, will happily
 * return the middle of a street or the centroid of a town for a query it did
 * not really understand, and delivering to the centroid of Leuven is not a
 * service we offer.
 */
function toMatch(properties: GeoapifyProperties): AddressMatch | null {
  if (properties.country_code !== "be") return null;

  const street = properties.street?.trim();
  const number = properties.housenumber?.trim();
  const postCode = properties.postcode?.trim();
  const municipality = localityOf(properties)?.trim();
  const { lat, lon } = properties;

  if (!street || !number || !postCode || !municipality) return null;
  if (typeof lat !== "number" || typeof lon !== "number") return null;

  const parts = {
    street: primaryNotation(street),
    number,
    postCode,
    municipality: primaryNotation(municipality),
  };

  return {
    id: properties.place_id?.trim() || formatAddress(parts),
    label: formatAddress(parts),
    ...parts,
    coordinates: { latitude: lat, longitude: lon },
  };
}

/** Never throws: the address field degrades to "we cannot check that right now". */
async function query(text: string): Promise<GeoapifyProperties[]> {
  const url = new URL(GEOAPIFY_ENDPOINT);

  url.searchParams.set("text", text);
  url.searchParams.set("filter", "countrycode:be");
  // Results near the kitchen first. Most orders are local, and without this a
  // street name that exists in six Belgian towns ranks arbitrarily.
  url.searchParams.set(
    "bias",
    `proximity:${ATELIER.longitude},${ATELIER.latitude}`,
  );
  url.searchParams.set("format", "geojson");
  url.searchParams.set("limit", String(MAX_SUGGESTIONS * 2));
  url.searchParams.set("apiKey", getApiKey());

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error(`[geoapify] lookup returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as GeoapifyResponse;

    return (data.features ?? [])
      .map((feature) => feature.properties)
      .filter((properties): properties is GeoapifyProperties =>
        Boolean(properties),
      );
  } catch (error) {
    console.error("[geoapify] lookup failed", error);
    return [];
  }
}

async function search(input: string): Promise<AddressSearch> {
  const trimmed = input.trim();
  if (trimmed.length < MIN_ADDRESS_QUERY_LENGTH) return EMPTY;
  if (!isGeoapifyConfigured()) return EMPTY;

  const results = await query(trimmed);

  const matches: AddressMatch[] = [];
  const seen = new Set<string>();
  const streets = new Set<string>();

  for (const properties of results) {
    const match = toMatch(properties);

    if (!match) {
      // A recognised street with no number is worth surfacing: the visitor is
      // one house number from a valid address.
      const street = properties.street?.trim();
      if (street && properties.country_code === "be") {
        streets.add(primaryNotation(street));
      }
      continue;
    }

    if (seen.has(match.id)) continue;

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

export const geoapifyProvider: AddressProvider = {
  name: "geoapify",
  search,
  resolve,
};
