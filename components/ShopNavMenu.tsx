import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { ShopifyCollection } from "@/lib/shopify/queries";

type ShopNavMenuProps = {
  collections: ShopifyCollection[];
};

const linkClassName =
  "font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60";

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
    <div className="grid items-start gap-8 border-t border-sky py-[3svh] pb-[4svh] pl-(--grid-gutter) pr-(--grid-gutter) nav:grid-cols-[minmax(0,1fr)_auto] nav:gap-12 lg:gap-16">
      <nav
        aria-label="Shop"
        className="flex flex-col gap-2.5 py-1 nav:min-w-36 lg:min-w-44"
      >
        <Link href={routes.shop} className={linkClassName}>
          All
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
        <div className="flex gap-5 lg:gap-8">
          {featured.map((collection) => (
            <FeaturedCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
