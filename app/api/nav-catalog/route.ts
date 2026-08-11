import { NextResponse } from "next/server";
import { toLocale } from "@/lib/i18n/config";
import { getCollections } from "@/lib/shopify/collections";
import { getProducts } from "@/lib/shopify/products";

/**
 * The catalogue the navbar needs, fetched after the page is interactive rather
 * than shipped inside it.
 *
 * The shop dropdown's preview images and the search panel's product list are
 * both behind an interaction — a hover, a click — but they were props on
 * `<Navbar>`, which lives in the root layout. Every prop crossing into a Client
 * Component is serialised into the RSC payload embedded in the HTML, so all 30
 * products, descriptions included, were parsed on every page of the site before
 * hydration could finish. That was ~21 KB of the home page's 115 KB payload,
 * for a panel most visitors never open.
 *
 * The collections still render server-side — they are the nav's link structure,
 * and they cost a title and a handle each. Only the product bodies moved here.
 *
 * Language comes in on the query string for the same reason as `/api/cart`:
 * this route sits outside `app/[lang]` and has no segment to read it from.
 */
export async function GET(request: Request) {
  const locale = toLocale(
    new URL(request.url).searchParams.get("lang") ?? undefined,
  );

  const [products, collections] = await Promise.all([
    getProducts(locale),
    getCollections(locale),
  ]);

  return NextResponse.json(
    {
      products,
      collections: collections.filter(
        (collection) => collection.handle !== "frontpage",
      ),
    },
    {
      headers: {
        /*
         * The catalogue changes when the kitchen edits Shopify, not per
         * request. A shared cache means one visitor's idle prefetch warms it
         * for everyone; `stale-while-revalidate` means nobody waits for the
         * refresh.
         */
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
