import { NextRequest, NextResponse } from "next/server";
import { completeAuthorizationCallback } from "@/lib/shopify/customer-account/auth";
import {
  OAUTH_RETURN_TO_COOKIE,
  isCustomerAccountConfigured,
} from "@/lib/shopify/customer-account/config";
import { requestLocale } from "@/lib/i18n/request-locale";
import { href, routes } from "@/lib/routes";

export async function GET(request: NextRequest) {
  // Read off the incoming request, before the callback clears the cookie: if
  // the sign-in fails, the customer is sent back to the sign-in page in the
  // language they left it in.
  const locale = requestLocale(
    request,
    request.cookies.get(OAUTH_RETURN_TO_COOKIE)?.value,
  );
  const signIn = new URL(href(locale, routes.signIn), request.url);

  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(signIn);
  }

  try {
    const returnTo = await completeAuthorizationCallback(
      request.nextUrl.searchParams,
    );
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch {
    signIn.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(signIn);
  }
}
