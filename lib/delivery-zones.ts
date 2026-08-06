/**
 * Delivery zones: what the trip costs, and how full the basket has to be before
 * we will make it.
 *
 * Like `lib/delivery.ts` this imports nothing from Shopify or `next/*`, so the
 * preferences bar, the cart gate and the server actions can all read it.
 *
 * Two things this module deliberately is not:
 *
 * 1. It is not what the customer is charged. The authoritative delivery fee is
 *    the Shopify shipping rate applied at the hosted checkout — this app cannot
 *    price that. The fees here are what the site *quotes*, and they have to be
 *    kept in step by hand with the shipping zones configured in the Shopify
 *    admin. If the two ever disagree, Shopify wins and the customer is annoyed.
 *
 * 2. It is not a road router. See `distanceFromAtelierKm`.
 */

export type Coordinates = { latitude: number; longitude: number };

/**
 * Where the trip starts. Every zone from 2 outwards is measured from this
 * point, so a placeholder that is off by a kilometre will push customers near a
 * band edge into the wrong fee and the wrong minimum order.
 *
 * TODO: replace with the atelier's real coordinates. This is the centroid of
 * 1190 Forest, which is the right commune and the wrong building.
 */
export const ATELIER: Coordinates = {
  latitude: 50.8118,
  longitude: 4.3245,
};

export type ZoneId = 1 | 2 | 3 | 4;

export type DeliveryZone = {
  id: ZoneId;
  /** Quoted on the site; charged by Shopify. Euros. */
  fee: number;
  /** The basket has to reach this before the zone can be booked. Euros. */
  minimumOrder: number;
  /**
   * Upper bound of the band, inclusive, in kilometres from the atelier. Null
   * for zone 1, which is an administrative area rather than a radius.
   */
  maxDistanceKm: number | null;
};

/**
 * The client's table, verbatim. Zone 1 is "Bruxelles" — a region, not a
 * distance — which is why it carries no radius and why `resolveDeliveryZone`
 * checks it before it measures anything.
 *
 * If the owners ever need to edit these themselves, they should move to
 * metaobjects the way the calendar's closures did in `lib/shopify/delivery.ts`.
 * They are in code for now because they have to agree with the shipping rates
 * in the Shopify admin, and two editable copies of the same number drift.
 */
const BRUSSELS_ZONE: DeliveryZone = {
  id: 1,
  fee: 10,
  minimumOrder: 100,
  maxDistanceKm: null,
};

export const DELIVERY_ZONES: DeliveryZone[] = [
  BRUSSELS_ZONE,
  { id: 2, fee: 15, minimumOrder: 125, maxDistanceKm: 15 },
  { id: 3, fee: 25, minimumOrder: 150, maxDistanceKm: 30 },
  { id: 4, fee: 35, minimumOrder: 200, maxDistanceKm: 50 },
];

const ZONE_BY_ID = new Map(DELIVERY_ZONES.map((zone) => [zone.id, zone]));

/** Past the last band we do not quote a price on the site at all. */
export const MAX_DELIVERY_DISTANCE_KM = 50;

/**
 * The Brussels-Capital Region's postcode range. The 19 communes run 1000–1212
 * (1000 Brussels through 1210 Saint-Josse, with the institutional codes in the
 * 1040s inside the range); 1300 and up is Walloon Brabant, 1500 and up Flemish
 * Brabant. Halle at 1500 and Wavre at 1300 are both well outside.
 *
 * Postcode rather than the geocoder's own region field because it is offline,
 * deterministic, and does not change shape when the address provider does.
 */
const BRUSSELS_POSTCODE_MIN = 1000;
const BRUSSELS_POSTCODE_MAX = 1212;

export function isBrusselsPostCode(postCode: string) {
  const code = Number(postCode.trim());
  if (!Number.isInteger(code)) return false;

  return code >= BRUSSELS_POSTCODE_MIN && code <= BRUSSELS_POSTCODE_MAX;
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Straight-line distance, not driving distance.
 *
 * Chosen deliberately: it needs no routing API, no key and no budget, it cannot
 * rate-limit us mid-checkout, and — the part that matters most — it is
 * deterministic. A cart quoted at zone 3 stays zone 3, where a live routing
 * service can return a different number an hour later because of roadworks and
 * silently reprice an order the customer already agreed to.
 *
 * The tradeoff to be honest with the client about: as the crow flies
 * under-measures road distance by roughly 20–30% in this part of Belgium, so
 * the bands are effectively a little generous. That is a pricing decision, not
 * a bug — but it should be what the terms of sale say.
 */
export function distanceFromAtelierKm(point: Coordinates) {
  const deltaLat = toRadians(point.latitude - ATELIER.latitude);
  const deltaLon = toRadians(point.longitude - ATELIER.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(ATELIER.latitude)) *
      Math.cos(toRadians(point.latitude)) *
      Math.sin(deltaLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Either a zone we can price on the spot, or a trip that has to be quoted by
 * hand. Past 50km the client quotes "sur devis", so this is not a failure —
 * it is a different, slower path to the same sale, and the UI has to send those
 * customers to the quote form rather than turning them away.
 */
export type ZoneResolution =
  | { kind: "zone"; zone: DeliveryZone; distanceKm: number }
  | { kind: "quote"; distanceKm: number };

export type ZoneAddress = {
  postCode: string;
  coordinates: Coordinates;
};

/**
 * Brussels first, then the radial bands.
 *
 * The order is what resolves the overlap in the client's table: zone 1 is
 * "Bruxelles" and zone 2 is "0 à 15 km", and most of Brussels is inside 15km of
 * the atelier, so without a precedence rule half the region would match both.
 *
 * The consequence to keep in mind — and to confirm with the client — is the
 * near periphery. Drogenbos, Linkebeek and Beersel sit a few kilometres from
 * Forest but outside the region, so they land in zone 2 and pay €15 with a €125
 * minimum, while an address twice as far away inside Brussels pays €10 with a
 * €100 minimum. That reads as intentional (Brussels gets the preferential
 * rate), but it is a sharp edge for a neighbour four kilometres down the road.
 *
 * Band bounds are inclusive of their upper edge, so exactly 15.0km is zone 2
 * rather than zone 3. The table's "0 à 15" / "15 à 30" overlaps at the
 * boundary; landing on the cheaper side of an arbitrary tie favours the
 * customer, which is the right way round for a number nobody can perceive.
 */
export function resolveDeliveryZone(address: ZoneAddress): ZoneResolution {
  const distanceKm = distanceFromAtelierKm(address.coordinates);

  if (isBrusselsPostCode(address.postCode)) {
    return { kind: "zone", zone: BRUSSELS_ZONE, distanceKm };
  }

  const zone = DELIVERY_ZONES.find(
    (candidate) =>
      candidate.maxDistanceKm !== null && distanceKm <= candidate.maxDistanceKm,
  );

  return zone ? { kind: "zone", zone, distanceKm } : { kind: "quote", distanceKm };
}

export function zoneById(id: ZoneId) {
  return ZONE_BY_ID.get(id) ?? null;
}

/**
 * The cart attribute the resolved zone rides on, following the same convention
 * as the delivery date and method: a human label, because the owners read it
 * off the order page in the Shopify admin.
 *
 * The distance goes in it too — "Zone 3 · 27.6 km" tells the kitchen what kind
 * of trip they have taken on. The fee deliberately does not: Shopify charges
 * the shipping rate, and an order carrying our number next to a different one
 * of theirs is worse than an order carrying neither.
 */
export const DELIVERY_ZONE_ATTRIBUTE = "Delivery zone";

export function formatZoneAttribute(zone: DeliveryZone, distanceKm: number) {
  return `Zone ${zone.id} · ${distanceKm.toFixed(1)} km`;
}

/**
 * Back to the zone from the stored label. Null for anything unrecognised,
 * including a value an owner edited by hand in the admin — the same discipline
 * `parseDeliveryMethod` applies, for the same reason.
 */
export function parseZoneAttribute(
  value: string | null | undefined,
): DeliveryZone | null {
  const id = Number(value?.trim().match(/^Zone (\d+)/)?.[1]);
  if (!Number.isInteger(id)) return null;

  return ZONE_BY_ID.get(id as ZoneId) ?? null;
}

/**
 * How much more has to go in the basket before this zone can be booked, or 0
 * when it already clears. The cart shows the gap rather than just refusing —
 * "add €23" is an instruction, "minimum €125" is a wall.
 *
 * `subtotal` is the merchandise total in euros, before the delivery fee: the
 * customer cannot buy their way to the minimum with the cost of the trip.
 */
export function minimumOrderShortfall(subtotal: number, zone: DeliveryZone) {
  return Math.max(0, zone.minimumOrder - subtotal);
}

export function clearsMinimumOrder(subtotal: number, zone: DeliveryZone) {
  return minimumOrderShortfall(subtotal, zone) === 0;
}

/**
 * Fees and minimums, for the cart page and the panel both.
 *
 * Cents only when there are cents: every figure in the table is a round number,
 * and "€10,00 delivery" reads like a machine wrote it. A shortfall is not
 * round, and there it shows them.
 *
 * The locale is hardcoded until the site has one to ask. When it does, this is
 * one of the handful of places that has to start reading it.
 */
export function formatEuros(amount: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
