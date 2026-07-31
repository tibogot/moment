import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { ProductCard } from "@/components/ProductCard";
import { routes } from "@/lib/routes";
import { getCollections } from "@/lib/shopify/collections";
import { getProducts } from "@/lib/shopify/products";

export const metadata: Metadata = {
  title: "Shop — Moment",
  description:
    "Order plates, salads and cold-pressed juices for delivery across Brussels.",
};

export default async function ShopPage() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);

  // Shopify seeds every store with a "frontpage" collection; it isn't a real
  // category, so keep it out of the filter row.
  const visibleCollections = collections.filter(
    (collection) => collection.handle !== "frontpage",
  );

  return (
    <>
      <PageIntro
        title="Shop"
        lead="Plates, salads and cold-pressed juices, prepared each morning and delivered across Brussels."
      />

      <GridSection className="pb-[14svh]">
        {visibleCollections.length > 0 && (
          <ul className="col-start-2 col-end-5 flex flex-wrap gap-x-4 gap-y-2 px-(--grid-gutter) pb-[6svh] md:col-end-9">
            {visibleCollections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={routes.collection(collection.handle)}
                  className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                >
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          {products.length === 0 ? (
            <p className="font-archivo-light text-[15px]">
              The catalogue is not available right now. Please try again later.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
