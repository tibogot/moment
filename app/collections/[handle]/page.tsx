import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { ProductCard } from "@/components/ProductCard";
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
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          {collection.products.length === 0 ? (
            <p className="font-archivo-light text-[15px]">
              Nothing in this collection yet.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
              {collection.products.map((product) => (
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
