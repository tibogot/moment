import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";

export const generateMetadata = localizedMetadata("collections", {
  path: routes.collections,
});

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const [collections, dict] = await Promise.all([
    getCollections(locale),
    getDictionary(locale),
  ]);

  // Shopify seeds every store with a "frontpage" collection; it isn't a real
  // category, so keep it out of the grid.
  const visibleCollections = collections.filter(
    (collection) => collection.handle !== "frontpage",
  );

  return (
    <>
      <PageIntro
        title={dict.pageIntro.collections.title}
        lead={dict.pageIntro.collections.lead}
      />

      <CollectionsSection collections={visibleCollections} showHeader={false} />

      <Footer />
    </>
  );
}
