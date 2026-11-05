import { NextResponse } from "next/server";
import { slotAttributeValue, slotId } from "@/lib/delivery-slots";
import { getFullSlots } from "@/lib/shopify/capacity";
import { getDeliverySlots } from "@/lib/shopify/delivery";

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

  const slots = await getDeliverySlots();
  const full = new Set(await getFullSlots(date, slots));

  return NextResponse.json({
    date,
    fullSlotIds: slots
      .filter((slot) => full.has(slotAttributeValue(slot)))
      .map(slotId),
  });
}
