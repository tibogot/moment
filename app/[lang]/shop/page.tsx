import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";
import { getProducts } from "@/lib/shopify/products";

export const generateMetadata = localizedMetadata({
  title: "Shop — Plates, Salads & Cold-Pressed Juices",
  description:
    "Order seasonal plates, salads and cold-pressed juices from our Brussels kitchen. Cooked the morning of delivery, ready to serve.",
  path: routes.shop,
  keywords: [
    "lunch delivery Brussels",
    "office lunch Brussels",
    "cold-pressed juice Brussels",
    "salads delivery Brussels",
  ],
});

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
        <ProductGrid products={products} collections={visibleCollections} />
      </GridSection>

      <Footer />
    </>
  );
}
