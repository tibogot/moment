import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, collectionSchema, graph } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";
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

  if (!collection) return notFoundMetadata();

  return pageMetadata({
    title: collection.title,
    description:
      toDescription(collection.description) ??
      `${collection.title} from Moment — cooked each morning in Brussels and delivered across the city.`,
    path: routes.collection(collection.handle),
    image: collection.imageUrl
      ? { url: collection.imageUrl, alt: collection.imageAlt }
      : null,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) notFound();

  return (
    <>
      <JsonLd
        data={graph(
          collectionSchema(collection),
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: "Collections", path: routes.collections },
            {
              name: collection.title,
              path: routes.collection(collection.handle),
            },
          ]),
        )}
      />

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
