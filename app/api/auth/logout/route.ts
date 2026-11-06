import { NextRequest, NextResponse } from "next/server";
import { buildLogoutUrl } from "@/lib/shopify/customer-account/auth";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
} from "@/lib/i18n/config";
import { href, routes } from "@/lib/routes";

/**
 * Signing out is a POST, from the form on the account page.
 *
 * Not a GET, which any page on the web could fire with an image tag to
 * sign the customer out without their knowing. The session cookie is
 * SameSite=Lax, so a POST from another site arrives without it and there is
 * nothing to end.
 *
 * Shopify sends the customer back to the bare domain afterwards — that is the
 * address registered with it, and changing it per language would mean
 * registering three. The bare domain honours the remembered language (see
 * proxy.ts), so the language the form carried is remembered here, and a Dutch
 * customer lands on the Dutch home page rather than the French one.
 */
export async function POST(request: NextRequest) {
  // 303, not the default 307: a 307 would repeat the POST at Shopify's
  // end-session endpoint, which expects a plain navigation.
  const response = NextResponse.redirect(await buildLogoutUrl(), 303);

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

/**
 * An old bookmark or a prefetch lands here. It signs nobody out: it goes to the
 * account page, where the button is.
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  const path = isLocale(lang) ? href(lang, routes.account) : routes.account;
  return NextResponse.redirect(new URL(path, request.url));
}
