import {
  DEFAULT_BOOKING_WINDOW_DAYS,
  DEFAULT_CLOSED_WEEKDAYS,
  DEFAULT_LEAD_TIME_DAYS,
  DEFAULT_ORDER_CUTOFF_HOUR,
  effectiveLeadTimeDays,
  expandClosureRange,
  firstBookableDate,
  isPastOrderCutoff,
  lastBookableDate,
  todayInDeliveryTimeZone,
  type DeliveryAvailability,
  DEFAULT_NEXT_DAY_CUTOFF_HOUR,
  DEFAULT_NEXT_DAY_LEAD_TIME_DAYS,
} from "@/lib/delivery/dates";
import {
  DEFAULT_DELIVERY_SLOTS,
  DEFAULT_PICKUP_WINDOW,
  isValidTime,
  DEFAULT_PICKUP_SLOTS,
  orderSlots,
  type DeliverySlot,
  type PickupWindow,
} from "@/lib/delivery/slots";
import {
  DEFAULT_ATELIER,
  DEFAULT_FREE_DELIVERY_THRESHOLD,
  DEFAULT_MINIMUM_PIECES_PER_PRODUCT,
  DEFAULT_NEXT_DAY_PICKUP_MINIMUM_ORDER,
  DEFAULT_PICKUP_MINIMUM_ORDER,
  type Coordinates,
} from "@/lib/delivery/zones";
import {
  metaobjectReader,
  strictMetaobjectReader,
  parseDecimalField,
  parseIntegerField,
  parseListField,
  type MetaobjectFields,
} from "./metaobjects";

/**
 * The delivery rules in time — when the kitchen will take an order for — read
 * from the Shopify admin so the owners change them without a deployment. The
 * rules in space live next door in `zones.ts`.
 *
 * Two metaobjects, both optional: every field falls back to the defaults in
 * `lib/delivery/dates.ts`. A shop with neither definition runs entirely on
 * those defaults.
 *
 * See docs/shopify-setup.md for the field-by-field setup.
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
const CUTOFF_HOUR_FIELD = "order_cutoff_hour";
const FREE_DELIVERY_FIELD = "free_delivery_threshold";
const PICKUP_MINIMUM_FIELD = "pickup_minimum_order";
const MINIMUM_PIECES_FIELD = "minimum_pieces_per_product";
const NEXT_DAY_LEAD_TIME_FIELD = "next_day_lead_time_days";
const NEXT_DAY_CUTOFF_HOUR_FIELD = "next_day_cutoff_hour";
const NEXT_DAY_PICKUP_MINIMUM_FIELD = "next_day_pickup_minimum_order";
const PICKUP_START_FIELD = "pickup_start_time";
const PICKUP_END_FIELD = "pickup_end_time";

/**
 * The delivery windows, one entry per slot. Two fields, both `HH:MM`:
 *
 *   `start_time`  09:00
 *   `end_time`    11:00
 *   `capacity`    2       optional integer — orders the window takes before it
 *                         is shown as full. Empty means 2.
 *
 * Order does not matter in the admin — `orderSlots` sorts them by start time,
 * because metaobject entries come back in whatever order Shopify holds them and
 * a picker offering 13:00–15:00 above 09:00–11:00 reads as a bug.
 */
const SLOT_METAOBJECT_TYPE = "delivery_slot";
const SLOT_START_FIELD = "start_time";
const SLOT_END_FIELD = "end_time";
const SLOT_CAPACITY_FIELD = "capacity";

const readClosures = strictMetaobjectReader(CLOSURE_METAOBJECT_TYPE);
const readSettings = metaobjectReader(SETTINGS_METAOBJECT_TYPE, 1);
const readSlots = metaobjectReader(SLOT_METAOBJECT_TYPE);

/**
 * The collection times, one entry per time:
 *
 *   `time`      11:30
 *   `capacity`  1       optional integer — orders that time takes. Empty means 1.
 *
 * No entries means the built-in eight (11:30 → 15:00).
 */
const PICKUP_SLOT_METAOBJECT_TYPE = "pickup_slot";
const PICKUP_SLOT_TIME_FIELD = "time";
const readPickupSlots = metaobjectReader(PICKUP_SLOT_METAOBJECT_TYPE);

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

/**
 * An `HH:MM` an owner typed, or null.
 *
 * Deliberately strict — no "9h", no "9:00", no "09.00". A time that half-parses
 * is how a collection window becomes 09:00–15:00 when it was meant to be
 * 11:00–15:00, and the fallback is a correct default, so refusing is cheap.
 */
function parseTimeField(raw: string | undefined): string | null {
  const value = raw?.trim();
  return value && isValidTime(value) ? value : null;
}

type DeliverySettings = {
  leadTimeDays: number;
  cutoffHour: number;
  closedWeekdays: number[];
  bookingWindowDays: number;
  atelier: Coordinates;
  freeDeliveryThreshold: number;
  pickupMinimumOrder: number;
  minimumPiecesPerProduct: number;
  nextDayLeadTimeDays: number;
  nextDayCutoffHour: number;
  nextDayPickupMinimumOrder: number;
  pickupWindow: PickupWindow;
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

  // Both halves of the collection window or neither, for the same reason as the
  // coordinates: a new opening time against the default closing time is a
  // window nobody chose.
  const pickupStart = parseTimeField(entry?.[PICKUP_START_FIELD]);
  const pickupEnd = parseTimeField(entry?.[PICKUP_END_FIELD]);

  return {
    leadTimeDays:
      parseIntegerField(entry?.[LEAD_TIME_FIELD], { min: 0, max: 90 }) ??
      DEFAULT_LEAD_TIME_DAYS,
    // 0–23. A cut-off of 24 would mean "never", which is what leaving the field
    // empty already means, and 0 means "today never counts" — both are sayable,
    // neither is a typo we have to guess at.
    cutoffHour:
      parseIntegerField(entry?.[CUTOFF_HOUR_FIELD], { min: 0, max: 23 }) ??
      DEFAULT_ORDER_CUTOFF_HOUR,
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
    freeDeliveryThreshold:
      parseDecimalField(entry?.[FREE_DELIVERY_FIELD], {
        min: 0,
        max: 100_000,
      }) ?? DEFAULT_FREE_DELIVERY_THRESHOLD,
    pickupMinimumOrder:
      parseDecimalField(entry?.[PICKUP_MINIMUM_FIELD], {
        min: 0,
        max: 100_000,
      }) ?? DEFAULT_PICKUP_MINIMUM_ORDER,
    minimumPiecesPerProduct:
      parseIntegerField(entry?.[MINIMUM_PIECES_FIELD], { min: 1, max: 100 }) ??
      DEFAULT_MINIMUM_PIECES_PER_PRODUCT,
    nextDayLeadTimeDays:
      parseIntegerField(entry?.[NEXT_DAY_LEAD_TIME_FIELD], { min: 0, max: 90 }) ??
      DEFAULT_NEXT_DAY_LEAD_TIME_DAYS,
    nextDayCutoffHour:
      parseIntegerField(entry?.[NEXT_DAY_CUTOFF_HOUR_FIELD], { min: 0, max: 23 }) ??
      DEFAULT_NEXT_DAY_CUTOFF_HOUR,
    nextDayPickupMinimumOrder:
      parseDecimalField(entry?.[NEXT_DAY_PICKUP_MINIMUM_FIELD], {
        min: 0,
        max: 100_000,
      }) ?? DEFAULT_NEXT_DAY_PICKUP_MINIMUM_ORDER,
    pickupWindow:
      pickupStart && pickupEnd
        ? { start: pickupStart, end: pickupEnd }
        : DEFAULT_PICKUP_WINDOW,
  };
}

/** Where the van leaves from, for the zone table to measure against. */
export async function getAtelier(): Promise<Coordinates> {
  return (await getDeliverySettings()).atelier;
}

/** The basket value at which the trip stops being charged, for the zone table. */
export async function getFreeDeliveryThreshold(): Promise<number> {
  return (await getDeliverySettings()).freeDeliveryThreshold;
}

/** The basket minimum for collection, carried on the zone table. */
export async function getPickupMinimumOrder(): Promise<number> {
  return (await getDeliverySettings()).pickupMinimumOrder;
}

/** The next-day collection minimum — see `ZoneTable.nextDayPickupMinimumOrder`. */
export async function getNextDayPickupMinimumOrder(): Promise<number> {
  return (await getDeliverySettings()).nextDayPickupMinimumOrder;
}

/**
 * The collection times, in order. Falls back to the built-in eight whenever
 * the admin has nothing usable: a collection with no time to pick cannot be
 * booked.
 */
export async function getPickupSlots(): Promise<DeliverySlot[]> {
  const entries: MetaobjectFields[] = await readPickupSlots();

  const slots = entries.flatMap((fields) => {
    const time = parseTimeField(fields[PICKUP_SLOT_TIME_FIELD]);
    if (!time) return [];
    const capacity = parseIntegerField(fields[SLOT_CAPACITY_FIELD], {
      min: 0,
      max: 100,
    });
    return [{ start: time, end: time, capacity: capacity ?? 1 }];
  });

  return slots.length > 0 ? orderSlots(slots) : DEFAULT_PICKUP_SLOTS;
}

/** Fewest identical pieces per product — see `ZoneTable.minimumPiecesPerProduct`. */
export async function getMinimumPiecesPerProduct(): Promise<number> {
  return (await getDeliverySettings()).minimumPiecesPerProduct;
}

export async function getPickupWindow(): Promise<PickupWindow> {
  return (await getDeliverySettings()).pickupWindow;
}

/**
 * The windows the van runs, in the order it runs them.
 *
 * Falls back to the built-in three whenever the admin has nothing usable —
 * including an empty definition, which is the state a shop is in before anyone
 * creates the entries. A cart with no slots to choose from cannot be completed,
 * so this is the one delivery setting that must never resolve to nothing.
 */
export async function getDeliverySlots(): Promise<DeliverySlot[]> {
  const entries: MetaobjectFields[] = await readSlots();

  const slots = entries.flatMap((fields) => {
    const start = parseTimeField(fields[SLOT_START_FIELD]);
    const end = parseTimeField(fields[SLOT_END_FIELD]);

    // A window that ends before it starts is a slip in the admin, and there is
    // no safe reading of it — dropping the entry leaves the customer two good
    // choices rather than one impossible one.
    if (!start || !end || end <= start) return [];

    // A capacity that does not parse is dropped back to the default rather
    // than the window being dropped: a typo must not withdraw a delivery hour.
    // Zero is allowed — it is how a window is closed for a while without
    // deleting it.
    const capacity = parseIntegerField(fields[SLOT_CAPACITY_FIELD], {
      min: 0,
      max: 100,
    });
    return [capacity === null ? { start, end } : { start, end, capacity }];
  });

  return slots.length > 0 ? orderSlots(slots) : DEFAULT_DELIVERY_SLOTS;
}

/**
 * Closed days, with every period flattened into the individual dates it covers.
 *
 * Clipped to the booking window on the way out. Past closures are noise the
 * calendar can never show — the owners are not expected to tidy up old entries
 * — and a period reaching past the far edge only matters up to that edge.
 *
 * Null when Shopify could not be read, which is not the same as no closures.
 */
async function getDeliveryClosures(bounds: {
  from: string;
  to: string;
}): Promise<string[] | null> {
  const entries = await readClosures();
  if (!entries) return null;

  const dates = entries.flatMap((fields) => {
    const start = fields[CLOSURE_DATE_FIELD];
    if (!start) return [];

    // No end date is the common case: one entry, one day. An end *before* the
    // start is a slip in the admin —
    // read it as that single day, because an entry the owners believe closes
    // the atelier must never expand to nothing.
    const end = fields[CLOSURE_END_DATE_FIELD];
    return expandClosureRange(start, end && end >= start ? end : start, bounds);
  });

  return [...new Set(dates)].sort();
}

export async function getDeliveryAvailability(): Promise<DeliveryAvailability> {
  // One `now` for the whole resolution. Read the clock twice and a request that
  // lands on 15:59:59.9 can decide the day from one reading and the cut-off from
  // the next, producing an availability object that contradicts itself.
  const now = new Date();
  const today = todayInDeliveryTimeZone(now);
  const settings = await getDeliverySettings();

  // The cut-off does not shorten the notice period, it moves when the notice
  // period starts counting — so it is folded in here, once, rather than left for
  // every caller to remember. `leadTimeDays` on the way out stays nominal; see
  // the note on `DeliveryAvailability`.
  const pastCutoff = isPastOrderCutoff(settings.cutoffHour, now);
  const firstBookable = firstBookableDate(
    today,
    effectiveLeadTimeDays(settings.leadTimeDays, settings.cutoffHour, now),
  );
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
    cutoffHour: settings.cutoffHour,
    pastCutoff,
    closedWeekdays: settings.closedWeekdays,
    closedDates: closedDates ?? [],
    closuresUnavailable: closedDates === null,
    // Same clock reading, the next-day notice and cut-off.
    nextDay: {
      firstBookable: firstBookableDate(
        today,
        effectiveLeadTimeDays(
          settings.nextDayLeadTimeDays,
          settings.nextDayCutoffHour,
          now,
        ),
      ),
      leadTimeDays: settings.nextDayLeadTimeDays,
      cutoffHour: settings.nextDayCutoffHour,
      pastCutoff: isPastOrderCutoff(settings.nextDayCutoffHour, now),
    },
  };
}
