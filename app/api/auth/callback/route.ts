import { NextRequest, NextResponse } from "next/server";
import { completeAuthorizationCallback } from "@/lib/shopify/customer-account/auth";
import { isCustomerAccountConfigured } from "@/lib/shopify/customer-account/config";
import { routes } from "@/lib/routes";

export async function GET(request: NextRequest) {
  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(new URL(routes.signIn, request.url));
  }

  try {
    const returnTo = await completeAuthorizationCallback(
      request.nextUrl.searchParams,
    );
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch {
    const errorUrl = new URL(routes.signIn, request.url);
    errorUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(errorUrl);
  }
}
