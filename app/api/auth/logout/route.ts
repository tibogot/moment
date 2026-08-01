import { NextResponse } from "next/server";
import { buildLogoutUrl } from "@/lib/shopify/customer-account/auth";

export async function GET() {
  return NextResponse.redirect(await buildLogoutUrl());
}
