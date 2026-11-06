import { NextResponse } from "next/server";
import { clientAddress, takeToken } from "@/lib/rate-limit";
import { slotAttributeValue, slotId } from "@/lib/delivery/slots";
import { getFullSlots } from "@/lib/shopify/capacity";
import {
  getDeliveryAvailability,
  getDeliverySlots,
} from "@/lib/shopify/delivery";

/** One answer per day picked; a person changes day a few times, not sixty. */
const CAPACITY_LIMIT = { limit: 60, windowMs: 60_000 };

/**
 * Which delivery windows are full on `?date=YYYY-MM-DD`, for the slot pickers.
 *
 * Its own route rather than riding on `/api/cart`, because the preferences bar
 * asks about a day the cart does not hold yet — the customer is still choosing.
 * Answers with slot ids, which is what the pickers key on. Anything wrong with
 * the date answers "nothing is full": this is a hint for the picker, and the
 * cart actions check the count again before anything is saved.
 */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";

  if (!takeToken(`capacity:${clientAddress(request.headers)}`, CAPACITY_LIMIT)) {
    return NextResponse.json(
      { date, fullSlotIds: [] },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Only days the calendar can actually offer. Every other date would cost an
  // Admin API call and a cache entry for an answer nobody can use.
  const availability = await getDeliveryAvailability();
  if (date < availability.today || date > availability.lastBookable) {
    return NextResponse.json({ date, fullSlotIds: [] });
  }

  const slots = await getDeliverySlots();
  const full = new Set(await getFullSlots(date, slots));

  return NextResponse.json({
    date,
    fullSlotIds: slots
      .filter((slot) => full.has(slotAttributeValue(slot)))
      .map(slotId),
  });
}
