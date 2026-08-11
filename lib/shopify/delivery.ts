import {
  DEFAULT_BOOKING_WINDOW_DAYS,
  DEFAULT_CLOSED_WEEKDAYS,
  DEFAULT_LEAD_TIME_DAYS,
  expandClosureRange,
  firstBookableDate,
  lastBookableDate,
  todayInDeliveryTimeZone,
  type DeliveryAvailability,
} from "@/lib/delivery";
import { DEFAULT_ATELIER, type Coordinates } from "@/lib/delivery-zones";
import {
  metaobjectReader,
  parseDecimalField,
  parseIntegerField,
  parseListField,
} from "./metaobjects";

/**
 * The delivery rules in time — when the kitchen will take an order for — read
 * from the Shopify admin so the owners change them without a deployment. The
 * rules in space live next door in `zones.ts`.
 *
 * Two metaobjects, both optional: every field falls back to the defaults in
 * `lib/delivery.ts`, which are the values that used to be hard-coded. A shop
 * with neither definition behaves exactly as it did before they existed.
 *
 * See SHOPIFY-SETUP.md for the field-by-field setup.
 */

/**
 * Days the owners close by hand — holidays, a full kitchen, staff off. One
 * entry can cover a period: `end_date` is optional and a missing one means the
 * closure is the single day in `date`.
 *
 * Deliberately not a built-in list of Belgian public holidays. A caterer's
 * best days are the ones everybody else takes off — closing 21 July
 * automatically would cost them the sale, not protect them.
 */
const CLOSURE_METAOBJECT_TYPE = "delivery_closure";
const CLOSURE_DATE_FIELD = "date";
const CLOSURE_END_DATE_FIELD = "end_date";

/** The standing rules. A singleton — only the first entry is read. */
const SETTINGS_METAOBJECT_TYPE = "delivery_settings";
const LEAD_TIME_FIELD = "lead_time_days";
const CLOSED_WEEKDAYS_FIELD = "closed_weekdays";
const BOOKING_WINDOW_FIELD = "booking_window_days";
const ATELIER_LATITUDE_FIELD = "atelier_latitude";
const ATELIER_LONGITUDE_FIELD = "atelier_longitude";

const readClosures = metaobjectReader(CLOSURE_METAOBJECT_TYPE);
const readSettings = metaobjectReader(SETTINGS_METAOBJECT_TYPE, 1);

/** `0` is Sunday, matching `Date#getDay`. */
const WEEKDAY_NUMBERS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Weekday names as the owners picked them in the admin, turned into numbers.
 *
 * Names rather than numbers because the admin shows this field to a person: a
 * dropdown reading "sunday" is checkable at a glance, where `0` is a thing you
 * have to be told.
 */
function parseClosedWeekdays(raw: string | undefined): number[] | null {
  const entries = parseListField(raw);
  if (!entries) return null;

  const days = entries
    .map((entry) => WEEKDAY_NUMBERS[entry.trim().toLowerCase()])
    .filter((day): day is number => day !== undefined);

  // An empty list is a real answer — "we deliver every day" — but an
  // unparseable one is not, and must not read as though nothing were closed.
  return days.length === entries.length ? [...new Set(days)] : null;
}

type DeliverySettings = {
  leadTimeDays: number;
  closedWeekdays: number[];
  bookingWindowDays: number;
  atelier: Coordinates;
};

async function getDeliverySettings(): Promise<DeliverySettings> {
  const [entry] = await readSettings();

  // Both halves of a coordinate or neither. Half a correction — a new latitude
  // against the placeholder longitude — puts the atelier in a field outside
  // Brussels and reprices every delivery, which is worse than not correcting it.
  const latitude = parseDecimalField(entry?.[ATELIER_LATITUDE_FIELD], {
    min: -90,
    max: 90,
  });
  const longitude = parseDecimalField(entry?.[ATELIER_LONGITUDE_FIELD], {
    min: -180,
    max: 180,
  });

  return {
    leadTimeDays:
      parseIntegerField(entry?.[LEAD_TIME_FIELD], { min: 0, max: 90 }) ??
      DEFAULT_LEAD_TIME_DAYS,
    closedWeekdays:
      parseClosedWeekdays(entry?.[CLOSED_WEEKDAYS_FIELD]) ??
      DEFAULT_CLOSED_WEEKDAYS,
    bookingWindowDays:
      parseIntegerField(entry?.[BOOKING_WINDOW_FIELD], {
        min: 1,
        max: 1095,
      }) ?? DEFAULT_BOOKING_WINDOW_DAYS,
    atelier:
      latitude !== null && longitude !== null
        ? { latitude, longitude }
        : DEFAULT_ATELIER,
  };
}

/** Where the van leaves from, for the zone table to measure against. */
export async function getAtelier(): Promise<Coordinates> {
  return (await getDeliverySettings()).atelier;
}

/**
 * Closed days, with every period flattened into the individual dates it covers.
 *
 * Clipped to the booking window on the way out. Past closures are noise the
 * calendar can never show — the owners are not expected to tidy up old entries
 * — and a period reaching past the far edge only matters up to that edge.
 */
async function getDeliveryClosures(bounds: {
  from: string;
  to: string;
}): Promise<string[]> {
  const entries = await readClosures();

  const dates = entries.flatMap((fields) => {
    const start = fields[CLOSURE_DATE_FIELD];
    if (!start) return [];

    // No end date is the common case and the old shape of this metaobject:
    // one entry, one day. An end *before* the start is a slip in the admin —
    // read it as that single day, because an entry the owners believe closes
    // the atelier must never expand to nothing.
    const end = fields[CLOSURE_END_DATE_FIELD];
    return expandClosureRange(start, end && end >= start ? end : start, bounds);
  });

  return [...new Set(dates)].sort();
}

export async function getDeliveryAvailability(): Promise<DeliveryAvailability> {
  const today = todayInDeliveryTimeZone();
  const settings = await getDeliverySettings();

  const firstBookable = firstBookableDate(today, settings.leadTimeDays);
  const lastBookable = lastBookableDate(today, settings.bookingWindowDays);
  const closedDates = await getDeliveryClosures({
    from: today,
    to: lastBookable,
  });

  return {
    today,
    firstBookable,
    lastBookable,
    leadTimeDays: settings.leadTimeDays,
    closedWeekdays: settings.closedWeekdays,
    closedDates,
  };
}
