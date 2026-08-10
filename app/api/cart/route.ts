import { NextResponse } from "next/server";
import { getCart } from "@/app/actions/cart";
import { getDeliveryRules } from "@/lib/shopify/zones";

/**
 * The delivery rules ride along with the cart so the panel's date picker and
 * its fee line never need a second round trip, so a date saved days ago is
 * re-checked against live closures every time the cart is read, and so a zone
 * saved before a price change is priced against today's table.
 */
export async function GET() {
  const [cart, { availability, zones }] = await Promise.all([
    getCart(),
    getDeliveryRules(),
  ]);

  return NextResponse.json({ cart, availability, zones });
}
