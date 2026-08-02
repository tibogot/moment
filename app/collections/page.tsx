import type { Metadata } from "next";
import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";

export const metadata: Metadata = pageMetadata({
  title: "Collections",
  description:
    "Browse plates, salads and cold-pressed juices by category — prepared each morning and delivered across Brussels.",
  path: routes.collections,
});

export default async function CollectionsPage() {
  const collections = await getCollections();

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
        leadClassName="text-[18px] md:text-[18px]"
      />

      <CollectionsSection
        collections={visibleCollections}
        showHeader={false}
      />

      <Footer />
    </>
  );
}
