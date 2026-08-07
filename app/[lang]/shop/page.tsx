import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ProductGrid } from "@/components/ProductGrid";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";
import { getProducts } from "@/lib/shopify/products";

export const generateMetadata = localizedMetadata("shop", {
  path: routes.shop,
});

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(toLocale(lang));
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
        title={dict.shop.title}
        lead={dict.shop.lead}
      />

      <GridSection className="pb-[14svh]">
        <ProductGrid products={products} collections={visibleCollections} />
      </GridSection>

      <Footer />
    </>
  );
}
