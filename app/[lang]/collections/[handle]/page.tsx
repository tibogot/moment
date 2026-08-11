import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
import { DEFAULT_LOCALE, toLocale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, collectionSchema, graph } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";
import {
  getCollectionByHandle,
  getCollections,
} from "@/lib/shopify/collections";

type CollectionPageProps = {
  params: Promise<{ lang: string; handle: string }>;
};

export async function generateStaticParams() {
  // Handles do not translate, so this only needs one language — and asking
  // for the default keeps `generateStaticParams` on one cache entry rather
  // than warming three to read the same list of slugs.
  const collections = await getCollections(DEFAULT_LOCALE);
  return collections.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { lang, handle } = await params;
  const locale = toLocale(lang);
  const [collection, dict] = await Promise.all([
    getCollectionByHandle(locale, handle),
    getDictionary(locale),
  ]);

  if (!collection) return notFoundMetadata();

  return pageMetadata({
    locale,
    title: collection.title,
    description:
      toDescription(collection.description) ??
      interpolate(dict.meta.fallback.collection, {
        title: collection.title,
      }),
    path: routes.collection(collection.handle),
    image: collection.imageUrl
      ? { url: collection.imageUrl, alt: collection.imageAlt }
      : null,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { lang, handle } = await params;
  const collection = await getCollectionByHandle(toLocale(lang), handle);

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
