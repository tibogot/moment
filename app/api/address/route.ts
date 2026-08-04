import { NextResponse } from "next/server";
import { searchAddresses } from "@/lib/address/urbis";
import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/order-preferences";

/**
 * Proxies the UrbIS lookup instead of letting the browser call it directly.
 * The service does send `Access-Control-Allow-Origin: *`, so a direct call
 * would work — but going through the server keeps every distinct query in
 * Next's fetch cache instead of only in one visitor's browser, and keeps
 * visitors' IP addresses out of a third party's logs before they have bought
 * anything.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_ADDRESS_QUERY_LENGTH) {
    return NextResponse.json({ matches: [], streets: [] });
  }

  return NextResponse.json(await searchAddresses(query));
}
