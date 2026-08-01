import { NextResponse } from "next/server";
import { refreshAndPersistCustomerSession } from "@/lib/shopify/customer-account/auth";
import { getCustomerProfile } from "@/lib/shopify/customer-account/customer";
import { getCustomerDisplayName } from "@/lib/shopify/customer-account/display-name";

export async function GET() {
  const session = await refreshAndPersistCustomerSession();

  if (!session) return NextResponse.json({ loggedIn: false });

  const profile = await getCustomerProfile();

  if (!profile.ok || !profile.customer) {
    return NextResponse.json({ loggedIn: true });
  }

  return NextResponse.json({
    loggedIn: true,
    displayName: getCustomerDisplayName(profile.customer),
  });
}
