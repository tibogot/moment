import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { CellGrid } from "@/components/v2/CellGrid";
import { PageIntroContent } from "@/components/v2/PageIntroGrid";
import { ProductGrid } from "@/components/ProductGrid";
import { ParallaxImage } from "@/components/ParallaxImage";
import { DEFAULT_LOCALE, toLocale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, collectionSchema, graph } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";
import {
  getCollectionByHandle,
  getCollections,
} from "@/lib/shopify/collections";

/**
 * A photo at the top of a family until its collection has its own in Shopify
 * (the owners' text document, 27 November 2026: "photo à retrouver dans
 * l'onglet Sweet Pots en haut", "photo dans Bagels & Sandwiches"). Their
 * photos, enlarged until the originals arrive.
 */
const COLLECTION_PHOTOS: Record<string, string> = {
  "sweet-pots": "/images/moment-sweet-pots.jpg",
  "bagels-sandwiches": "/images/moment-sandwiches.jpg",
};

type CollectionPageProps = {
  params: Promise<{ lang: string; handle: string }>;
};

export async function generateStaticParams() {
  // Handles do not translate, so this only needs one language — and asking
  // for the default keeps `generateStaticParams` on one cache entry rather
  // than warming three to read the same list of slugs.
  const collections = await getCollections(DEFAULT_LOCALE);
  return collections
    .filter(({ handle }) => handle !== HIDDEN_COLLECTION)
    .map(({ handle }) => ({ handle }));
}

/**
 * Shopify seeds every store with a "frontpage" collection. It is not a
 * category, the nav and the sitemap already leave it out, and it must not be a
 * page either — prerendered and indexable, it would be a duplicate of the shop.
 */
const HIDDEN_COLLECTION = "frontpage";

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { lang, handle } = await params;
  const locale = toLocale(lang);
  const [collection, dict] = await Promise.all([
    getCollectionByHandle(locale, handle),
    getDictionary(locale),
  ]);

  if (!collection || handle === HIDDEN_COLLECTION)
    return notFoundMetadata(dict.common.notFound.title);

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
  const locale = toLocale(lang);
  const [collection, dict] = await Promise.all([
    getCollectionByHandle(locale, handle),
    getDictionary(locale),
  ]);

  if (!collection || handle === HIDDEN_COLLECTION) notFound();

  // Shopify's own collection photo first, else the owners' photo for it.
  const headerPhoto =
    collection.ownImageUrl ?? COLLECTION_PHOTOS[collection.handle] ?? null;

  return (
    <>
      <JsonLd
        data={graph(
          collectionSchema(locale, collection),
          breadcrumbSchema(locale, [
            { name: dict.nav.home, path: routes.home },
            // The shop, not the list of collections: that page redirects
            // to it since 28 November 2026.
            { name: dict.nav.shop, path: routes.shop },
            {
              name: collection.title,
              path: routes.collection(collection.handle),
            },
          ]),
        )}
      />

      {/* On the page's 16 / 12 / 4 grid since 28 November 2026, like the
          shop: the frame, the title and lead on the cells, the photo as a
          3/4 block of whole cells (6 by 6 rows on a desktop or a tablet, the
          full 4 on a phone), then the cards. */}
      <div className="v2">
        <section
          className="relative w-full bg-cream"
          style={{ paddingTop: "var(--grid-band)" }}
        >
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            cells={false}
            readout={false}
            bottomBand="0px"
          />
          <PageIntroContent
            title={collection.title}
            lead={collection.description || undefined}
          />
          <div
            className="relative grid pb-[14svh]"
            style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
          >
            {headerPhoto && (
              <div className="col-[2/span_4] mb-[8svh] p-(--v2-pad) md:col-[2/span_6]">
                {/* The owners' photos are portraits. */}
                <div className="relative aspect-3/4 overflow-hidden">
                  <ParallaxImage
                    src={headerPhoto}
                    alt=""
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="absolute inset-0"
                  />
                </div>
              </div>
            )}
            {/* The cards are h3s; a hidden h2 keeps the outline unbroken. */}
            <h2 className="sr-only">{dict.shop.productsHeading}</h2>
            <ProductGrid
              products={collection.products}
              emptyMessage={dict.shop.emptyCollection}
            />
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
