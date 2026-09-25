import { NextRequest, NextResponse } from "next/server";
import { buildLogoutUrl } from "@/lib/shopify/customer-account/auth";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
} from "@/lib/i18n/config";

/**
 * Shopify sends the customer back to the bare domain after signing out — that
 * is the address registered with it, and changing it per language would mean
 * registering three. The bare domain honours the remembered language (see
 * proxy.ts), so the language the sign-out link carried is remembered here, and
 * a Dutch customer lands on the Dutch home page rather than the French one.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(await buildLogoutUrl());

  const lang = request.nextUrl.searchParams.get("lang");
  if (isLocale(lang)) {
    response.cookies.set(LOCALE_COOKIE, lang, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}
