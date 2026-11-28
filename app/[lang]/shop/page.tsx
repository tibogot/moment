import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { CellGrid } from "@/components/v2/CellGrid";
import { PageIntroContent } from "@/components/v2/PageIntroGrid";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopSearchGrid } from "@/components/ShopSearchGrid";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";
import { getProducts } from "@/lib/shopify/products";
import { getZoneTable } from "@/lib/shopify/zones";
import { OrderRulesNote } from "@/components/OrderRulesNote";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, graph, shopSchema } from "@/lib/schema";
import { interpolate } from "@/lib/i18n/dictionaries";
import { maxDeliveryDistanceKm } from "@/lib/delivery/zones";

export const generateMetadata = localizedMetadata("shop", {
  path: routes.shop,
});

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const dict = await getDictionary(locale);
  const [products, collections, zones] = await Promise.all([
    getProducts(locale),
    getCollections(locale),
    getZoneTable(),
  ]);

  // Shopify seeds every store with a "frontpage" collection; it isn't a real
  // category, so keep it out of the filter row.
  const visibleCollections = collections.filter(
    (collection) => collection.handle !== "frontpage",
  );

  const seo = dict.shop.seo;

  return (
    <>
      <JsonLd
        data={graph(
          shopSchema(
            locale,
            dict.shop.title,
            dict.meta.shop.description,
            products,
          ),
          breadcrumbSchema(locale, [
            { name: dict.nav.home, path: routes.home },
            { name: dict.nav.shop, path: routes.shop },
          ]),
        )}
      />
      {/* On the page's 16 / 12 / 4 grid since 28 November 2026, like the FAQ
          and Où nous trouver: the frame (the navbar's rule, the two spines),
          the title and lead on the cells, the order rules and the filters
          between the spines, then the cards — each one whole cells
          (ProductGrid, ProductCell). */}
      <div className="v2">
        <section
          className="relative w-full bg-cream"
          style={{ paddingTop: "var(--grid-band)" }}
        >
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            cells={false}
            readout={false}
            bottomBand="0px"
          />
          <PageIntroContent title={dict.shop.title} lead={dict.shop.lead} />
          <div
            className="relative grid pb-[14svh]"
            style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
          >
            {/* The cards are h3s; this keeps the outline h1 → h2 → h3 for
                search engines and screen readers without a visible label. */}
            <h2 className="sr-only">{dict.shop.productsHeading}</h2>
            {/* Minimums and fees up front, not first met in the cart. */}
            <OrderRulesNote
              locale={locale}
              dict={dict}
              zones={zones}
              className="col-[2/-2] px-(--v2-pad) pb-[2svh]"
            />
            <Suspense
              fallback={
                <ProductGrid
                  products={products}
                  collections={visibleCollections}
                />
              }
            >
              <ShopSearchGrid
                products={products}
                collections={visibleCollections}
              />
            </Suspense>
          </div>
        </section>

        {/* What the shop is and where it delivers, in words: the page was all
            product names, and nothing on the site named a commune but Forest
            (audit, 26 November 2026). The radius is the live zone table's.
            Text on the left half, the communes on the right half. */}
        <section className="relative w-full bg-cream">
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            cells={false}
            readout={false}
            bands={false}
          />
          <div
            className="relative grid gap-y-[6svh] pt-[10svh] pb-[14svh]"
            style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
          >
            <div className="col-[2/span_4] min-w-0 px-(--v2-pad) md:col-[2/span_6] lg:col-[2/span_8]">
              <h2 className="font-owners-narrow-bold text-[8vw] leading-[0.95] uppercase md:text-[min(3vw,5svh)]">
                {seo.heading}
              </h2>
              <p className="font-archivo-light mt-6 max-w-[62ch] text-(length:--body-text) leading-normal">
                {seo.body}
              </p>
            </div>
            <div className="col-[2/span_4] min-w-0 px-(--v2-pad) md:col-[8/span_6] lg:col-[10/span_8]">
              <h3 className="font-owners-medium text-[12px] tracking-wide uppercase">
                {seo.communesHeading}
              </h3>
              <ul className="font-archivo-light mt-4 columns-2 gap-x-6 text-[16px] leading-relaxed">
                {seo.communes.map((commune) => (
                  <li key={commune}>{commune}</li>
                ))}
              </ul>
              <p className="font-archivo-light mt-6 text-[16px] leading-normal">
                {interpolate(seo.beyond, {
                  km: maxDeliveryDistanceKm(zones),
                  towns: seo.towns,
                })}
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
