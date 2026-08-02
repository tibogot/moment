import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
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
        leadClassName="text-[18px] md:text-[18px]"
      />

      <GridSection className="pb-[14svh]">
        {visibleCollections.length > 0 && (
          <div className="col-start-2 col-end-5 border-t border-sky px-(--grid-gutter) py-[4svh] md:col-end-9">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
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
          </div>
        )}

        <ProductGrid products={products} />
      </GridSection>

      <Footer />
    </>
  );
}
