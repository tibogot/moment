import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/ProductPurchase";
import {
  getDeliveryAvailability,
  getMinimumPiecesPerProduct,
} from "@/lib/shopify/delivery";
import { getZoneTable } from "@/lib/shopify/zones";
import { OrderRulesNote } from "@/components/OrderRulesNote";
import {
  DEFAULT_NEXT_DAY_CUTOFF_HOUR,
  formatCutoffHour,
} from "@/lib/delivery/dates";
import { hasNextDayTag } from "@/lib/delivery/next-day";
import { TrackViewItem } from "@/components/TrackViewItem";
import { Footer } from "@/components/Footer";
import { CellGrid } from "@/components/v2/CellGrid";
import { DietCode, dietCodes, showsDietCode } from "@/components/DietCode";
import { JsonLd } from "@/components/JsonLd";
import { OrderPreferencesBar } from "@/components/OrderPreferencesBar";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductRelatedSection } from "@/components/ProductRelatedSection";
import { DEFAULT_LOCALE, toLocale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, graph, productSchema } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";
import {
  getProductByHandle,
  getProducts,
  getSimilarProducts,
} from "@/lib/shopify/products";

type ProductPageProps = {
  params: Promise<{ lang: string; handle: string }>;
};

export async function generateStaticParams() {
  // See the note in collections/[handle] — handles do not translate.
  const products = await getProducts(DEFAULT_LOCALE);
  return products.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { lang, handle } = await params;
  const locale = toLocale(lang);
  const [product, dict] = await Promise.all([
    getProductByHandle(locale, handle),
    getDictionary(locale),
  ]);

  if (!product) return notFoundMetadata(dict.common.notFound.title);

  // "Carrot cake — Moment" said nothing a search for "carrot cake livraison
  // Bruxelles" could match; the place goes in the title. Short Shopify
  // descriptions (most are one line) get the delivery sentence after them.
  const described = toDescription(product.description);
  const description =
    described && described.length < 110
      ? toDescription(
          `${described.replace(/[.!\s]*$/, ".")} ${dict.meta.fallback.productSuffix}`,
        )
      : described;

  return pageMetadata({
    locale,
    title: interpolate(dict.meta.fallback.productTitle, {
      title: product.title,
    }),
    // Shopify descriptions run long; a trimmed sentence beats a hard cut.
    description:
      description ??
      interpolate(dict.meta.fallback.product, { title: product.title }),
    path: routes.product(product.handle),
    image: product.imageUrl
      ? { url: product.imageUrl, alt: product.imageAlt }
      : null,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { lang, handle } = await params;
  const locale = toLocale(lang);
  const dict = await getDictionary(locale);
  const [product, allProducts, minimumQuantity, availability, zones] =
    await Promise.all([
      getProductByHandle(locale, handle),
      getProducts(locale),
      getMinimumPiecesPerProduct(),
      getDeliveryAvailability(),
      getZoneTable(),
    ]);

  if (!product) notFound();

  const similarProducts = getSimilarProducts(allProducts, product);
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [{ url: product.imageUrl, altText: product.imageAlt }]
        : [];

  // Analytics names products by handle: stable across languages and readable
  // in GA reports, where a Shopify gid is neither.
  const analyticsItem = {
    item_id: product.handle,
    item_name: product.title,
    price: Number(product.priceAmount) || 0,
  };

  return (
    <>
      {/* Price, availability and images — what a rich result needs to show the
          product in search rather than a plain blue link. */}
      <JsonLd
        data={graph(
          productSchema(locale, product, {
            fee: Math.min(...zones.zones.map((zone) => zone.fee)),
            leadTimeDays: availability.leadTimeDays,
          }),
          breadcrumbSchema(locale, [
            { name: dict.nav.home, path: routes.home },
            { name: dict.nav.shop, path: routes.shop },
            { name: product.title, path: routes.product(product.handle) },
          ]),
        )}
      />

      {/* On the page's 16 / 12 / 4 grid since 28 November 2026, like the shop:
          the frame, then on the cells — the order preferences across the
          page, the gallery over cells 1–8 and the product over 10–16 (one
          cell of air between), stacked on a phone. Less top space on a
          phone: more left ~200px of empty cream above the photo and pushed
          the price and the button below the fold. */}
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
          <div
            className="relative grid pt-[5svh] pb-[12svh] md:pt-[12svh]"
            style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
          >
            {/* Cart-level, not product-level: the same three answers apply to the
            whole order. It sits here because this is where the decision to buy
            actually gets made.

            Sized deliberately below the product title underneath it — this
            frames the controls, it is not the headline of the page.

            On a phone it moves after the product: stacked first, its date,
            window, address and method filled the whole first screen and pushed
            the photo, the name and the price below the fold. */}
            <section
              aria-labelledby="order-preferences"
              className="order-last col-[2/-2] mt-[8svh] px-(--v2-pad) md:order-first md:mt-0 md:mb-[6svh]"
            >
              {/* A label, not a heading: on desktop it sits above the product,
              and as an h2 it came before the page's h1 in the outline. */}
              <p
                id="order-preferences"
                className="font-owners-narrow-bold text-[7vw] leading-[0.95] uppercase md:text-[min(2.2vw,3.4svh)]"
              >
                {dict.product.orderPreferencesTitle}
              </p>

              {/* No promise that the catalogue changes with these answers — it does
              not. What they do buy is not having to work it out at checkout. */}
              {/* 18px, the same as every other lead on the site: Archivo Light
              sets small and anything under it stops reading as body copy. */}
              <p className="font-archivo-light mt-3 mb-6 max-w-[80ch] text-[18px] leading-normal">
                {dict.product.orderPreferences}
              </p>

              <OrderPreferencesBar />
            </section>

            <div className="col-[2/span_4] min-w-0 px-(--v2-pad) md:col-[2/span_6] lg:col-[2/span_8]">
              <ProductGallery images={galleryImages} title={product.title} />
            </div>

            <div className="col-[2/span_4] mt-[5svh] min-w-0 px-(--v2-pad) md:col-[8/span_6] md:mt-0 lg:col-[11/span_7]">
              <h1 className="font-owners-narrow-bold text-[10vw] leading-[0.95] wrap-break-word uppercase md:text-[min(4vw,6svh)]">
                {product.title}
              </h1>
              {/* The diet as the label writes it, spelt out beside it. */}
              {showsDietCode(product.productType) &&
                dietCodes(product.tags ?? []).length > 0 && (
                  <p className="font-archivo-light mt-3 text-[17px]">
                    <DietCode
                      tags={product.tags ?? []}
                      labels={dict.shop.filters.tags}
                      className="mr-2 text-[17px]"
                    />
                    {dietCodes(product.tags ?? [])
                      .map((key) => dict.shop.filters.tags[key])
                      .join(", ")}
                  </p>
                )}

              {/* Price, size (when there are several) and Add to cart, with
              the description between the price and the sizes. */}
              <ProductPurchase
                variants={product.variants}
                defaultVariantId={product.variantId}
                analyticsItem={analyticsItem}
                minimumQuantity={minimumQuantity}
              >
                {product.descriptionHtml ? (
                  <div
                    className="product-description font-archivo-light mt-6 text-[18px] leading-[1.6] [&_p+p]:mt-4"
                    dangerouslySetInnerHTML={{
                      __html: product.descriptionHtml,
                    }}
                  />
                ) : product.description ? (
                  <p className="font-archivo-light mt-6 text-[18px] leading-[1.6] whitespace-pre-line">
                    {product.description}
                  </p>
                ) : null}
              </ProductPurchase>
              <TrackViewItem item={analyticsItem} />
              {hasNextDayTag(product.tags ?? []) && (
                <p className="font-archivo-light mt-2 text-[13px] opacity-70">
                  {interpolate(dict.product.nextDayNote, {
                    cutoff: formatCutoffHour(
                      availability.nextDay?.cutoffHour ??
                        DEFAULT_NEXT_DAY_CUTOFF_HOUR,
                    ),
                  })}
                </p>
              )}

              <OrderRulesNote
                locale={locale}
                dict={dict}
                zones={zones}
                className="mt-3"
              />

              {product.details && (
                <ProductDetails details={product.details} copy={dict.product} />
              )}
            </div>
          </div>
        </section>

        <ProductRelatedSection
          similar={similarProducts}
          allProducts={allProducts}
          currentHandle={handle}
        />
      </div>

      <Footer />
    </>
  );
}
