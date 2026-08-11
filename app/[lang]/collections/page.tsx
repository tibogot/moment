import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
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
  const collections = await getCollections(toLocale((await params).lang));

  // Shopify seeds every store with a "frontpage" collection; it isn't a real
  // category, so keep it out of the grid.
  const visibleCollections = collections.filter(
    (collection) => collection.handle !== "frontpage",
  );

  return (
    <>
      <PageIntro
        title="Collections"
        lead="Plates, salads and cold-pressed juices — browse by category."
      />

      <CollectionsSection collections={visibleCollections} showHeader={false} />

      <Footer />
    </>
  );
}
