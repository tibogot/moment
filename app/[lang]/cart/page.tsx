import { redirect } from "next/navigation";
import { toLocale } from "@/lib/i18n/config";
import { href, routes } from "@/lib/routes";

/**
 * The cart is the panel, not a page (28 November 2026): one order form —
 * items, delivery or pickup, address, date, slot — kept in one place. The
 * page had the same steps in the old style, and two forms had to stay in
 * step.
 *
 * The address stays for whatever still points at it (Shopify's "back to
 * cart", an old bookmark): it lands on the shop with the panel open.
 */
export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`${href(toLocale(lang), routes.shop)}?cart=open`);
}
