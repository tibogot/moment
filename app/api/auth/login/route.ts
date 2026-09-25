import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  safeReturnPath,
} from "@/lib/shopify/customer-account/auth";
import { isCustomerAccountConfigured } from "@/lib/shopify/customer-account/config";
import { routes } from "@/lib/routes";

export async function GET(request: NextRequest) {
  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(new URL(routes.signIn, request.url));
  }

  const safeReturnTo = safeReturnPath(
    request.nextUrl.searchParams.get("return_to"),
  );

  return NextResponse.redirect(await buildAuthorizationUrl(safeReturnTo));
}
