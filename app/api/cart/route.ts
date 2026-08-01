import { NextResponse } from "next/server";
import { getCart } from "@/app/actions/cart";

export async function GET() {
  const cart = await getCart();
  return NextResponse.json({ cart });
}
