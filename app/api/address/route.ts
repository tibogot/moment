import { NextResponse } from "next/server";
import { searchAddresses } from "@/lib/address";
import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/delivery/order-preferences";
import { clientAddress, takeToken } from "@/lib/rate-limit";

/** A street, a number and a town fit comfortably; anything longer is not an address. */
const MAX_QUERY_LENGTH = 120;

/**
 * Generous for a person — the field is debounced, and nobody types sixty
 * addresses a minute — and far below what a script needs to spend the day's
 * Geoapify quota in an afternoon.
 */
const LOOKUP_LIMIT = { limit: 60, windowMs: 60_000 };

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

  if (
    query.length < MIN_ADDRESS_QUERY_LENGTH ||
    query.length > MAX_QUERY_LENGTH
  ) {
    return NextResponse.json({ matches: [], streets: [] });
  }

  if (!takeToken(`address:${clientAddress(request.headers)}`, LOOKUP_LIMIT)) {
    return NextResponse.json(
      { matches: [], streets: [] },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return NextResponse.json(await searchAddresses(query));
}
