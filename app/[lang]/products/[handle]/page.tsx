import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { OrderPreferencesBar } from "@/components/OrderPreferencesBar";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductRowSection } from "@/components/ProductRowSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
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

  if (!product) return notFoundMetadata();

  return pageMetadata({
    locale,
    title: product.title,
    // Shopify descriptions run long; a trimmed sentence beats a hard cut.
    description:
      toDescription(product.description) ??
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
  const [product, allProducts] = await Promise.all([
    getProductByHandle(locale, handle),
    getProducts(locale),
  ]);

  if (!product) notFound();

  const similarProducts = getSimilarProducts(allProducts, product);
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [{ url: product.imageUrl, altText: product.imageAlt }]
        : [];

  return (
    <>
      {/* Price, availability and images — what a rich result needs to show the
          product in search rather than a plain blue link. */}
      <JsonLd
        data={graph(
          productSchema(product),
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: "Shop", path: routes.shop },
            { name: product.title, path: routes.product(product.handle) },
          ]),
        )}
      />

      <GridSection className="pt-[22svh] pb-[12svh]">
        {/* Cart-level, not product-level: the same three answers apply to the
            whole order. It sits here because this is where the decision to buy
            actually gets made.

            Sized deliberately below the product title underneath it — this
            frames the controls, it is not the headline of the page. */}
        <section
          aria-labelledby="order-preferences"
          className="col-start-2 col-end-5 mb-[6svh] px-(--grid-gutter) md:col-end-9"
        >
          <h2
            id="order-preferences"
            className="font-owners-narrow-bold text-[7vw] leading-[0.95] uppercase md:text-[min(2.2vw,3.4svh)]"
          >
            {dict.product.orderPreferences}
          </h2>

          {/* No promise that the catalogue changes with these answers — it does
              not. What they do buy is not having to work it out at checkout. */}
          {/* 18px, the same as every other lead on the site: Archivo Light
              sets small and anything under it stops reading as body copy. */}
          <p className="font-archivo-light mt-3 mb-6 max-w-[80ch] text-[18px] leading-normal">
            {dict.product.orderPreferences}
          </p>

          <OrderPreferencesBar />
        </section>

        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-6">
          <ProductGallery images={galleryImages} title={product.title} />
        </div>

        <div className="col-start-2 col-end-5 mt-[5svh] px-(--grid-gutter) md:col-start-6 md:col-end-9 md:mt-0">
          <h1 className="font-owners-narrow-bold text-[10vw] leading-[0.95] wrap-break-word uppercase md:text-[min(4vw,6svh)]">
            {product.title}
          </h1>

          <p className="font-archivo-light mt-4 text-[16px]">{product.price}</p>

          {product.descriptionHtml ? (
            <div
              className="product-description font-archivo-light mt-6 text-[18px] leading-[1.6] [&_p+p]:mt-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : product.description ? (
            <p className="font-archivo-light mt-6 text-[18px] leading-[1.6] whitespace-pre-line">
              {product.description}
            </p>
          ) : null}

          <AddToCartButton
            variantId={product.variantId}
            available={product.availableForSale}
            className="mt-8"
          />

          {product.details && (
            <ProductDetails details={product.details} copy={dict.product} />
          )}
        </div>
      </GridSection>

      {similarProducts.length > 0 && (
        <ProductRowSection
          title={dict.product.similar}
          viewAllLabel={dict.common.seeEverything}
          soldOutLabel={dict.product.soldOut}
          products={similarProducts}
          viewAllHref={routes.shop}
          className="pb-0"
        />
      )}

      <RecentlyViewedSection
        allProducts={allProducts}
        currentHandle={handle}
        className={similarProducts.length > 0 ? "pt-[5svh]" : undefined}
      />

      <Footer />
    </>
  );
}
