import { NextRequest, NextResponse } from "next/server";
import {
  refreshAndPersistCustomerSession,
  safeReturnPath,
} from "@/lib/shopify/customer-account/auth";
import { clearCustomerSession } from "@/lib/shopify/customer-account/session";
import { requestLocale } from "@/lib/i18n/request-locale";
import { href, routes } from "@/lib/routes";

/**
 * Where an expiring login is renewed, because this is somewhere a cookie can
 * be written and a page is not. The account page sends the customer here and
 * names the way back; they do not see it happen.
 *
 * If the refresh is refused — or `reset` asks for it outright, because Shopify
 * already rejected the token — the session is dropped and they are sent to
 * sign in again, in the language they were reading.
 */
export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return_to");
  const signIn = new URL(
    href(requestLocale(request, returnTo), routes.signIn),
    request.url,
  );

  if (request.nextUrl.searchParams.get("reset") === "1") {
    await clearCustomerSession();
    return NextResponse.redirect(signIn);
  }

  const session = await refreshAndPersistCustomerSession();
  if (!session) return NextResponse.redirect(signIn);

  return NextResponse.redirect(new URL(safeReturnPath(returnTo), request.url));
}
