import { NextResponse } from "next/server";
import { searchAddresses } from "@/lib/address";
import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/order-preferences";

/**
 * Proxies the address lookup instead of letting the browser call it directly.
 * Going through the server keeps every distinct query in Next's fetch cache
 * instead of only in one visitor's browser, and keeps visitors' IP addresses
 * out of a third party's logs before they have bought anything.
 *
 * With Geoapify in front it is also the only option: the API key lives in the
 * server environment and must never reach the browser, and the shared cache is
 * what keeps a free tier of 3,000 lookups a day from being spent on keystrokes.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_ADDRESS_QUERY_LENGTH) {
    return NextResponse.json({ matches: [], streets: [] });
  }

  return NextResponse.json(await searchAddresses(query));
}
