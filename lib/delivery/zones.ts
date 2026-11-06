/**
 * Delivery zones: what the trip costs, and how full the basket has to be before
 * we will make it.
 *
 * Like `lib/delivery/dates.ts` this imports nothing from Shopify or `next/*`, so the
 * preferences bar, the cart gate and the server actions can all read it. And
 * like `lib/delivery/dates.ts`, the table itself is *data*: it is read from the
 * Shopify admin and passed in, so the owners can move a fee without a
 * deployment. `DEFAULT_ZONE_TABLE` is what applies when nothing is configured,
 * and it is the client's table verbatim.
 *
 * Two things this module deliberately is not:
 *
 * 1. It is not what the customer is charged. The authoritative delivery fee is
 *    the Shopify shipping rate applied at the hosted checkout — this app cannot
 *    price that. The fees here are what the site *quotes*, and they have to be
 *    kept in step by hand with the shipping zones configured in the Shopify
 *    admin. If the two ever disagree, Shopify wins and the customer is annoyed.
 *
 *    Moving the table into the admin does not remove that duplication; it puts
 *    the two copies in the same building, so whoever changes one is standing in
 *    front of the other. docs/shopify-setup.md says so on the page where it matters.
 *
 * 2. It is not a road router. See `distanceFromAtelierKm`.
 */

export type Coordinates = { latitude: number; longitude: number };

/**
 * Where the trip starts.
 *
 * Every band is measured from this point, so a placeholder off by a kilometre
 * pushes customers near a band edge into the wrong fee and the wrong minimum
 * order. It is Rue des Glands 21A, 1190 Forest, geocoded from the address the
 * owners gave. The Shopify admin can override it — an atelier that moves is a
 * settings change, not a deployment — but it does not *have* to.
 */
export const DEFAULT_ATELIER: Coordinates = {
  latitude: 50.81976,
  longitude: 4.32657,
};

/**
 * Not a literal union. The bands come from the admin, so how many there are is
 * the owners' business, not the type system's.
 */
export type ZoneId = number;

export type DeliveryZone = {
  id: ZoneId;
  /** Quoted on the site; charged by Shopify. Euros. */
  fee: number;
  /** The basket has to reach this before the zone can be booked. Euros. */
  minimumOrder: number;
  /**
   * Basket value from which this band's delivery is free, in euros. Null
   * falls back to the table-wide `ZoneTable.freeDeliveryThreshold`. Further
   * bands cost more to reach, so each has its own threshold.
   */
  freeDeliveryThreshold: number | null;
  /**
   * Upper bound of the band, inclusive, in kilometres from the atelier. Null
   * marks an administrative zone — an area rather than a radius — which the
   * current table does not use. See `resolveDeliveryZone`.
   */
  maxDistanceKm: number | null;
};

/**
 * The whole pricing picture in one object, so the callers that need it take one
 * argument rather than four and cannot be handed a table measured from
 * somebody else's atelier.
 */
export type ZoneTable = {
  atelier: Coordinates;
  /** Ordered: any administrative zone first, then the bands, nearest out. */
  zones: DeliveryZone[];
  /**
   * Basket value at which the trip stops being charged, in euros. See
   * `freeDeliveryShortfall` for what this does and does not promise.
   */
  freeDeliveryThreshold: number;
  /**
   * The basket minimum for collection at the atelier, in euros. "Le minimum
   * de commande est donc de 100 € dans tous les cas … qu'il s'agisse d'une
   * livraison ou d'un retrait" — the owners. Collection still
   * pays no fee.
   */
  pickupMinimumOrder: number;
};

/**
 * Spend this much and the delivery is free, whatever band the address is in.
 *
 * The owners' notes gave this twice and gave two different numbers — €300 under
 * the zone table, €250 under the fees heading. €300 is the confirmed one; the
 * €250 line was an earlier draft. It is a setting in the Shopify admin because
 * it is exactly the sort of number a caterer moves for a season.
 */
export const DEFAULT_FREE_DELIVERY_THRESHOLD = 300;

/** See `ZoneTable.pickupMinimumOrder`. A setting in the Shopify admin. */
export const DEFAULT_PICKUP_MINIMUM_ORDER = 100;

/**
 * The client's table (fees and minimums; the
 * per-band free-delivery thresholds they also gave are not modelled yet — see
 * `freeDeliveryThreshold`, still one number). Four priced bands measured
 * from the atelier, and a fifth case — beyond the last band — quoted by hand
 * rather than priced on the site.
 *
 * Bands are radii, not administrative areas, and that is worth saying out loud
 * to the client because it moves real customers: Forest sits in the south-west
 * of the Region, so the north-east of Brussels — Haren, Neder-Over-Heembeek,
 * parts of Woluwe — is 11–14 km out and lands in band 2 at €20 with a €150
 * minimum, not at €10 and €100 with the rest of Brussels. That is what a
 * distance table does; it is not a bug, but nobody has confirmed they want it.
 */
export const DEFAULT_ZONE_TABLE: ZoneTable = {
  atelier: DEFAULT_ATELIER,
  freeDeliveryThreshold: DEFAULT_FREE_DELIVERY_THRESHOLD,
  pickupMinimumOrder: DEFAULT_PICKUP_MINIMUM_ORDER,
  zones: [
    { id: 1, fee: 10, minimumOrder: 100, freeDeliveryThreshold: 250, maxDistanceKm: 10 },
    { id: 2, fee: 20, minimumOrder: 150, freeDeliveryThreshold: 300, maxDistanceKm: 25 },
    { id: 3, fee: 35, minimumOrder: 250, freeDeliveryThreshold: 400, maxDistanceKm: 50 },
    { id: 4, fee: 50, minimumOrder: 350, freeDeliveryThreshold: 450, maxDistanceKm: 70 },
  ],
};

/**
 * Past the last band we do not quote a price on the site at all.
 *
 * Derived rather than declared: a constant sitting next to the last band's
 * radius would be two places to change and one of them to forget.
 */
export function maxDeliveryDistanceKm(table: ZoneTable) {
  return table.zones.reduce(
    (furthest, zone) => Math.max(furthest, zone.maxDistanceKm ?? 0),
    0,
  );
}

/**
 * The Brussels-Capital Region's postcode range. The 19 communes run 1000–1212
 * (1000 Brussels through 1210 Saint-Josse, with the institutional codes in the
 * 1040s inside the range); 1300 and up is Walloon Brabant, 1500 and up Flemish
 * Brabant. Halle at 1500 and Wavre at 1300 are both well outside.
 *
 * Postcode rather than the geocoder's own region field because it is offline,
 * deterministic, and does not change shape when the address provider does.
 *
 * Nothing in the current table exercises this — the client's bands are all
 * radial. It stays because the administrative zone is a shape the Shopify
 * metaobject still accepts (leave `max_distance_km` empty and this is what
 * decides who falls in it), and a caterer asking for "one flat rate inside
 * Brussels" would then be a settings change rather than a rebuild. Delete it
 * the day that stops being plausible, not before.
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
export function distanceFromAtelierKm(atelier: Coordinates, point: Coordinates) {
  const deltaLat = toRadians(point.latitude - atelier.latitude);
  const deltaLon = toRadians(point.longitude - atelier.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(atelier.latitude)) *
      Math.cos(toRadians(point.latitude)) *
      Math.sin(deltaLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Either a zone we can price on the spot, or a trip that has to be quoted by
 * hand. Past the last band the client quotes "sur devis", so this is not a
 * failure — it is a different, slower path to the same sale, and the UI has to
 * send those customers to the quote form rather than turning them away.
 */
export type ZoneResolution =
  | { kind: "zone"; zone: DeliveryZone; distanceKm: number }
  | { kind: "quote"; distanceKm: number };

export type ZoneAddress = {
  postCode: string;
  coordinates: Coordinates;
};

/**
 * Any administrative zone first, then the radial bands, nearest out.
 *
 * The precedence rule exists because the two shapes can overlap: a zone defined
 * as "Brussels" and a band defined as "0–10 km" would both match most of the
 * Region. Whichever band carries no radius is the administrative one, and it
 * wins. The client's current table has none, so in practice this walks straight
 * to the bands.
 *
 * Band bounds are inclusive of their upper edge, so exactly 25.0 km is band 2
 * rather than band 3. The table's "10 – 25" / "25 – 50" overlaps at the
 * boundary; landing on the cheaper side of an arbitrary tie favours the
 * customer, which is the right way round for a number nobody can perceive.
 */
export function resolveDeliveryZone(
  table: ZoneTable,
  address: ZoneAddress,
): ZoneResolution {
  const distanceKm = distanceFromAtelierKm(table.atelier, address.coordinates);

  const regionZone = table.zones.find((zone) => zone.maxDistanceKm === null);
  if (regionZone && isBrusselsPostCode(address.postCode)) {
    return { kind: "zone", zone: regionZone, distanceKm };
  }

  const zone = table.zones.find(
    (candidate) =>
      candidate.maxDistanceKm !== null && distanceKm <= candidate.maxDistanceKm,
  );

  return zone
    ? { kind: "zone", zone, distanceKm }
    : { kind: "quote", distanceKm };
}

export function zoneById(table: ZoneTable, id: ZoneId) {
  return table.zones.find((zone) => zone.id === id) ?? null;
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
 * The zone id off the stored label. Null for anything unrecognised, including a
 * value an owner edited by hand in the admin — the same discipline
 * `parseDeliveryMethod` applies, for the same reason.
 *
 * Only the id, not the zone: the label is written when the address is saved and
 * read back long afterwards, by which time the table may have moved. Whoever
 * needs the fee looks it up against the table they are holding, and gets null
 * if that band no longer exists.
 */
export function parseZoneAttribute(
  value: string | null | undefined,
): ZoneId | null {
  const id = Number(value?.trim().match(/^Zone (\d+)/)?.[1]);
  return Number.isInteger(id) ? id : null;
}

/**
 * How much more has to go in the basket before this zone can be booked, or 0
 * when it already clears. The cart shows the gap rather than just refusing —
 * "add €23" is an instruction, "minimum €150" is a wall.
 *
 * `subtotal` is the merchandise total in euros, before the delivery fee: the
 * customer cannot buy their way to the minimum with the cost of the trip.
 */
export function minimumOrderShortfall(subtotal: number, zone: DeliveryZone) {
  return Math.max(0, zone.minimumOrder - subtotal);
}

/**
 * The basket value from which this band's delivery is free: its own
 * threshold, or the table-wide one when the band does not set it.
 *
 * The same caveat as every other number in this file — Shopify charges the
 * shipping rate, so each band's threshold has to exist *there* too, as a
 * price-based €0 rate above it in that band's shipping zone. Set it here and
 * not there and the site promises free delivery while the checkout charges
 * the fee, the most expensive way these two tables can disagree.
 */
export function freeDeliveryThresholdFor(zone: DeliveryZone, table: ZoneTable) {
  return zone.freeDeliveryThreshold ?? table.freeDeliveryThreshold;
}

/**
 * Whether this basket has bought its way out of the band's delivery fee.
 *
 * Measured on the merchandise subtotal, like the minimum order and for the same
 * reason: a threshold you can reach by being charged more for the trip is not a
 * threshold.
 */
export function qualifiesForFreeDelivery(
  subtotal: number,
  zone: DeliveryZone,
  table: ZoneTable,
) {
  return subtotal >= freeDeliveryThresholdFor(zone, table);
}

/**
 * How much more would make this band's delivery free, or 0 when it already is.
 *
 * Only meaningful once the address — and so the band — is known, and not shown
 * against an empty basket: "spend €250 for free delivery" with nothing in the
 * cart is noise rather than an offer. Callers check both.
 */
export function freeDeliveryShortfall(
  subtotal: number,
  zone: DeliveryZone,
  table: ZoneTable,
) {
  return Math.max(0, freeDeliveryThresholdFor(zone, table) - subtotal);
}
