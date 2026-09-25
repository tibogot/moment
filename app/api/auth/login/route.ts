import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  safeReturnPath,
} from "@/lib/shopify/customer-account/auth";
import { isCustomerAccountConfigured } from "@/lib/shopify/customer-account/config";
import { requestLocale } from "@/lib/i18n/request-locale";
import { href, routes } from "@/lib/routes";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return_to");

  if (!isCustomerAccountConfigured()) {
    const locale = requestLocale(request, returnTo);
    return NextResponse.redirect(
      new URL(href(locale, routes.signIn), request.url),
    );
  }

  return NextResponse.redirect(
    await buildAuthorizationUrl(safeReturnPath(returnTo)),
  );
}
