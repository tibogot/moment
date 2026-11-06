import type { DeliveryAvailability } from "@/lib/delivery/dates";
import type { DeliverySlot, PickupWindow } from "@/lib/delivery/slots";
import {
  DEFAULT_ZONE_TABLE,
  type Coordinates,
  type DeliveryZone,
  type ZoneTable,
} from "@/lib/delivery/zones";
import {
  getAtelier,
  getDeliveryAvailability,
  getDeliverySlots,
  getFreeDeliveryThreshold,
  getPickupMinimumOrder,
  getPickupWindow,
} from "./delivery";
import {
  metaobjectReader,
  parseDecimalField,
  parseIntegerField,
  type MetaobjectFields,
} from "./metaobjects";

/**
 * The delivery zone table, read from the Shopify admin.
 *
 * Read the header of `lib/delivery/zones.ts` before changing anything here. The
 * short version: these fees are what the site *quotes*, and Shopify's own
 * shipping rates are what the customer is *charged*. The two are configured
 * separately and have to agree. Putting this table in the admin does not merge
 * them — it puts them in the same building, which is the most that can be done
 * without giving up on quoting a fee before checkout.
 *
 * Set up in Shopify, once:
 *   1. Settings -> Custom data -> Metaobjects -> Add definition
 *   2. Name it so the type resolves to `delivery_zone`
 *   3. Fields, all required except `max_distance_km`:
 *        `zone_id`         Integer  — 1, 2, 3 … as the customer sees it
 *        `fee`             Decimal  — euros
 *        `minimum_order`   Decimal  — euros
 *        `max_distance_km` Decimal  — the band's outer edge. Leave **empty**
 *                                     only for an administrative zone (an area
 *                                     rather than a radius); the client's
 *                                     current table has none.
 *        `brussels_region` Boolean  — optional. Must be ticked for an empty
 *                                     radius to count as the Brussels zone.
 *   4. Enable Storefront API access on the definition
 *   5. One entry per band
 *
 * With the owners' table, that is four entries: 10 km /
 * €10 / €100, 25 km / €20 / €150, 50 km / €35 / €250, 70 km / €50 / €350. There is no
 * fifth entry for "> 70 km" — a band with no price is not a band, it is the
 * absence of one, and the site sends those addresses to the quote form.
 *
 * The atelier the distances are measured from, and the free-delivery threshold
 * that overrides every fee here, both live on `delivery_settings` next to the
 * lead time — see `lib/shopify/delivery.ts`.
 */
const ZONE_METAOBJECT_TYPE = "delivery_zone";
const ZONE_ID_FIELD = "zone_id";
const FEE_FIELD = "fee";
const MINIMUM_ORDER_FIELD = "minimum_order";
const MAX_DISTANCE_FIELD = "max_distance_km";
const BRUSSELS_REGION_FIELD = "brussels_region";

const readZoneEntries = metaobjectReader(ZONE_METAOBJECT_TYPE);

/** Generous bounds. These reject a typo, not a pricing decision. */
const ZONE_ID_RANGE = { min: 1, max: 99 };
const EUROS_RANGE = { min: 0, max: 10_000 };
const DISTANCE_RANGE = { min: 0, max: 1_000 };

function parseZone(fields: MetaobjectFields): DeliveryZone | null {
  const id = parseIntegerField(fields[ZONE_ID_FIELD], ZONE_ID_RANGE);
  const fee = parseDecimalField(fields[FEE_FIELD], EUROS_RANGE);
  const minimumOrder = parseDecimalField(
    fields[MINIMUM_ORDER_FIELD],
    EUROS_RANGE,
  );

  if (id === null || fee === null || minimumOrder === null) return null;

  // A *present* but unreadable radius is a failure: "abc" km must not quietly
  // become "the Brussels zone".
  const rawDistance = fields[MAX_DISTANCE_FIELD];
  const maxDistanceKm =
    rawDistance === undefined
      ? null
      : parseDecimalField(rawDistance, DISTANCE_RANGE);

  if (rawDistance !== undefined && maxDistanceKm === null) return null;

  // An *empty* one is how the administrative zone is written, and that zone
  // outranks every band — so an empty radius alone is not enough to make one.
  // Otherwise a band whose radius was cleared by accident would become "all of
  // Brussels", and every address in the Region would be charged its fee and
  // its minimum. The owners have to say so, with a tick, and a band that lost
  // its radius without one is a bad entry like any other.
  if (
    maxDistanceKm === null &&
    fields[BRUSSELS_REGION_FIELD]?.trim().toLowerCase() !== "true"
  ) {
    return null;
  }

  return { id, fee, minimumOrder, maxDistanceKm };
}

/**
 * All of the table or none of it.
 *
 * A half-parsed table is worse than no table: drop the 25 km band because
 * somebody typed a comma into its fee, and every address between 10 and 25 km
 * silently falls through to the 50 km band and is quoted €15 too much. There is
 * no safe partial answer to a price, so one bad entry sends the whole thing back
 * to the defaults and says so in the log.
 */
function parseZoneTable(
  entries: MetaobjectFields[],
  atelier: Coordinates,
  freeDeliveryThreshold: number,
  pickupMinimumOrder: number,
): ZoneTable | null {
  if (entries.length === 0) return null;

  const zones: DeliveryZone[] = [];
  for (const entry of entries) {
    const zone = parseZone(entry);
    if (!zone) {
      console.error(
        `[shopify] a "${ZONE_METAOBJECT_TYPE}" entry could not be read — falling back to the built-in zone table`,
      );
      return null;
    }
    zones.push(zone);
  }

  // Metaobject entries come back in whatever order the admin holds them, and
  // `resolveDeliveryZone` walks the bands outwards and takes the first that
  // fits. Unsorted, a 20 km address could match the 50 km band before the 25 km
  // one it belongs in. The radius-less zone leads, as it does in the defaults.
  zones.sort((a, b) => (a.maxDistanceKm ?? -1) - (b.maxDistanceKm ?? -1));

  return { atelier, zones, freeDeliveryThreshold, pickupMinimumOrder };
}

/**
 * The free-delivery threshold rides on the table rather than on the bands, and
 * it comes from `delivery_settings` rather than from a `delivery_zone` entry:
 * it is one number that applies across every band, and putting it on each band
 * would mean four places to change it and three chances to leave one behind.
 *
 * It survives a broken zone table on purpose. A typo'd fee sends the bands back
 * to the built-in defaults, but the threshold the owners set is still the
 * threshold they set, and quietly reverting it to €300 alongside would be a
 * second, silent pricing change nobody asked for.
 */
export async function getZoneTable(): Promise<ZoneTable> {
  const [entries, atelier, freeDeliveryThreshold, pickupMinimumOrder] =
    await Promise.all([
      readZoneEntries(),
      getAtelier(),
      getFreeDeliveryThreshold(),
      getPickupMinimumOrder(),
    ]);

  return (
    parseZoneTable(
      entries,
      atelier,
      freeDeliveryThreshold,
      pickupMinimumOrder,
    ) ?? {
      ...DEFAULT_ZONE_TABLE,
      atelier,
      freeDeliveryThreshold,
      pickupMinimumOrder,
    }
  );
}

/**
 * Every delivery rule the pages that gate a cart need: which days, which
 * windows, and what the trip costs. Fetched together because they are read
 * together and all three are cached; nothing here is a round trip the caller
 * could have avoided by asking for one.
 */
export async function getDeliveryRules(): Promise<{
  availability: DeliveryAvailability;
  zones: ZoneTable;
  slots: DeliverySlot[];
  pickupWindow: PickupWindow;
}> {
  const [availability, zones, slots, pickupWindow] = await Promise.all([
    getDeliveryAvailability(),
    getZoneTable(),
    getDeliverySlots(),
    getPickupWindow(),
  ]);

  return { availability, zones, slots, pickupWindow };
}
