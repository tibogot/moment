import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { ShopifyCollection } from "@/lib/shopify/queries";

type ShopNavMenuProps = {
  collections: ShopifyCollection[];
};

const linkClassName =
  "animated-underline font-owners-medium text-[12px] uppercase tracking-wide";

type FeaturedCardProps = {
  collection: ShopifyCollection;
};

function FeaturedCard({ collection }: FeaturedCardProps) {
  if (!collection.imageUrl) return null;

  return (
    <Link
      href={routes.collection(collection.handle)}
      className="group flex w-44 shrink-0 flex-col gap-3 lg:w-52"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-sky/20">
        <Image
          src={collection.imageUrl}
          alt={collection.imageAlt}
          fill
          sizes="(max-width: 1280px) 176px, 208px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <span className={linkClassName}>{collection.title}</span>
    </Link>
  );
}

export function ShopNavMenu({ collections }: ShopNavMenuProps) {
  const featured = collections.filter((collection) => collection.imageUrl).slice(0, 2);

  return (
    <div
      className="grid border-t border-sky"
      style={{ gridTemplateColumns: "var(--grid-columns)" }}
    >
      <nav
        aria-label="Shop"
        className="relative col-start-2 col-end-4 flex flex-col gap-2.5 self-start px-(--grid-gutter) pt-[4svh] pb-[4svh]"
      >
        <Link href={routes.shop} className={linkClassName}>
          All
        </Link>
        <Link href={routes.collections} className={linkClassName}>
          Collections
        </Link>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={routes.collection(collection.handle)}
            className={linkClassName}
          >
            {collection.title}
          </Link>
        ))}
      </nav>

      {featured.length > 0 && (
        <div className="relative col-start-4 col-end-9">
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-sky"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-sky"
            aria-hidden
          />

          <div className="flex gap-5 px-(--grid-gutter) pt-[4svh] pb-4 lg:gap-8">
            {featured.map((collection) => (
              <FeaturedCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      )}

      <div className="col-span-full h-px bg-sky" aria-hidden />
      <div className="col-span-full min-h-(--grid-band)" />
    </div>
  );
}
