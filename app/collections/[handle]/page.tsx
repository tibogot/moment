import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
import {
  getCollectionByHandle,
  getCollections,
} from "@/lib/shopify/collections";

type CollectionPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) return { title: "Not found — Moment" };

  return {
    title: `${collection.title} — Moment`,
    description: collection.description.slice(0, 160),
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) notFound();

  return (
    <>
      <PageIntro
        title={collection.title}
        lead={collection.description || undefined}
      />

      <GridSection className="pb-[14svh]">
        <ProductGrid
          products={collection.products}
          emptyMessage="Nothing in this collection yet."
        />
      </GridSection>

      <Footer />
    </>
  );
}
