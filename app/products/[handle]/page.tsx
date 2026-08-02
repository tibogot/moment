import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductRowSection } from "@/components/ProductRowSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, graph, productSchema } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";
import {
  getProductByHandle,
  getProducts,
  getSimilarProducts,
} from "@/lib/shopify/products";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return notFoundMetadata();

  return pageMetadata({
    title: product.title,
    // Shopify descriptions run long; a trimmed sentence beats a hard cut.
    description:
      toDescription(product.description) ??
      `${product.title} from the Moment kitchen in Brussels.`,
    path: routes.product(product.handle),
    image: product.imageUrl
      ? { url: product.imageUrl, alt: product.imageAlt }
      : null,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const [product, allProducts] = await Promise.all([
    getProductByHandle(handle),
    getProducts(),
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

          {product.details && <ProductDetails details={product.details} />}
        </div>
      </GridSection>

      {similarProducts.length > 0 && (
        <ProductRowSection
          title="Similar products"
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
