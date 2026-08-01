import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/shopify/customer-account/auth";
import { isCustomerAccountConfigured } from "@/lib/shopify/customer-account/config";
import { routes } from "@/lib/routes";

export async function GET(request: NextRequest) {
  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(new URL(routes.signIn, request.url));
  }

  const returnTo =
    request.nextUrl.searchParams.get("return_to") ?? routes.account;
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : routes.account;

  return NextResponse.redirect(await buildAuthorizationUrl(safeReturnTo));
}
