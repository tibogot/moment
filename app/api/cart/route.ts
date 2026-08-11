import { NextResponse } from "next/server";
import { getCart } from "@/app/actions/cart";
import { toLocale } from "@/lib/i18n/config";
import { getDeliveryRules } from "@/lib/shopify/zones";

/**
 * The delivery rules ride along with the cart so the panel's date picker and
 * its fee line never need a second round trip, so a date saved days ago is
 * re-checked against live closures every time the cart is read, and so a zone
 * saved before a price change is priced against today's table.
 *
 * The language comes in on the query string because this route has no segment
 * to read it from — it sits outside `app/[lang]`, and Shopify needs to be told
 * which language to return line titles in. The client store reads it off
 * `location.pathname`, which is where the language already is. Anything
 * unrecognised falls back to the default rather than erroring: a cart badge is
 * not worth a 400.
 */
export async function GET(request: Request) {
  const locale = toLocale(
    new URL(request.url).searchParams.get("lang") ?? undefined,
  );

  const [cart, { availability, zones }] = await Promise.all([
    getCart(locale),
    getDeliveryRules(),
  ]);

  return NextResponse.json({ cart, availability, zones });
}
