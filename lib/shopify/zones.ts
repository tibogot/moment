import type { DeliveryAvailability } from "@/lib/delivery";
import {
  DEFAULT_ZONE_TABLE,
  type Coordinates,
  type DeliveryZone,
  type ZoneTable,
} from "@/lib/delivery-zones";
import { getAtelier, getDeliveryAvailability } from "./delivery";
import {
  metaobjectReader,
  parseDecimalField,
  parseIntegerField,
  type MetaobjectFields,
} from "./metaobjects";

/**
 * The delivery zone table, read from the Shopify admin.
 *
 * Read the header of `lib/delivery-zones.ts` before changing anything here. The
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
 *        `max_distance_km` Decimal  — the band's outer edge. Leave **empty** on
 *                                     the Brussels zone, which is a region
 *                                     rather than a radius.
 *   4. Enable Storefront API access on the definition
 *   5. One entry per band
 *
 * The atelier the distances are measured from lives on `delivery_settings`, next
 * to the lead time — see `lib/shopify/delivery.ts`.
 */
const ZONE_METAOBJECT_TYPE = "delivery_zone";
const ZONE_ID_FIELD = "zone_id";
const FEE_FIELD = "fee";
const MINIMUM_ORDER_FIELD = "minimum_order";
const MAX_DISTANCE_FIELD = "max_distance_km";

const readZoneEntries = metaobjectReader(ZONE_METAOBJECT_TYPE);

/** Generous bounds. These reject a typo, not a pricing decision. */
const ZONE_ID_RANGE = { min: 1, max: 99 };
const EUROS_RANGE = { min: 0, max: 10_000 };
const DISTANCE_RANGE = { min: 0, max: 1_000 };

function parseZone(fields: MetaobjectFields): DeliveryZone | null {
  const id = parseIntegerField(fields.get(ZONE_ID_FIELD), ZONE_ID_RANGE);
  const fee = parseDecimalField(fields.get(FEE_FIELD), EUROS_RANGE);
  const minimumOrder = parseDecimalField(
    fields.get(MINIMUM_ORDER_FIELD),
    EUROS_RANGE,
  );

  if (id === null || fee === null || minimumOrder === null) return null;

  // Empty is meaningful here — it is what marks the administrative zone — so an
  // absent field is null rather than a failure. A *present* but unreadable one
  // still is: "abc" km must not quietly become "the Brussels zone".
  const rawDistance = fields.get(MAX_DISTANCE_FIELD);
  const maxDistanceKm =
    rawDistance === undefined
      ? null
      : parseDecimalField(rawDistance, DISTANCE_RANGE);

  if (rawDistance !== undefined && maxDistanceKm === null) return null;

  return { id, fee, minimumOrder, maxDistanceKm };
}

/**
 * All of the table or none of it.
 *
 * A half-parsed table is worse than no table: drop the 30 km band because
 * somebody typed a comma into its fee, and every address between 15 and 30 km
 * silently falls through to the 50 km band and is quoted €10 too much. There is
 * no safe partial answer to a price, so one bad entry sends the whole thing back
 * to the defaults and says so in the log.
 */
function parseZoneTable(
  entries: MetaobjectFields[],
  atelier: Coordinates,
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
  // fits. Unsorted, a 40 km address could match the 50 km band before the 30 km
  // one it belongs in. The radius-less zone leads, as it does in the defaults.
  zones.sort((a, b) => (a.maxDistanceKm ?? -1) - (b.maxDistanceKm ?? -1));

  return { atelier, zones };
}

export async function getZoneTable(): Promise<ZoneTable> {
  const [entries, atelier] = await Promise.all([
    readZoneEntries(),
    getAtelier(),
  ]);

  return parseZoneTable(entries, atelier) ?? { ...DEFAULT_ZONE_TABLE, atelier };
}

/**
 * Both halves of the delivery rules, for the pages that gate a cart on them —
 * which is most of the pages that need either. Fetched together because they
 * are read together and both are cached; nothing here is a second round trip
 * the caller could have avoided by asking for one.
 */
export async function getDeliveryRules(): Promise<{
  availability: DeliveryAvailability;
  zones: ZoneTable;
}> {
  const [availability, zones] = await Promise.all([
    getDeliveryAvailability(),
    getZoneTable(),
  ]);

  return { availability, zones };
}
