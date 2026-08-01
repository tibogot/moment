import { NextResponse } from "next/server";
import { getCart } from "@/app/actions/cart";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

/**
 * Availability rides along with the cart so the panel's date picker never needs
 * a second round trip, and so a date saved days ago is re-checked against live
 * closures every time the cart is read.
 */
export async function GET() {
  const [cart, availability] = await Promise.all([
    getCart(),
    getDeliveryAvailability(),
  ]);

  return NextResponse.json({ cart, availability });
}
