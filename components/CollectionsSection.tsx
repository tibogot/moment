import Image from "next/image";
import Link from "next/link";
import { GridSection } from "@/components/GridSection";
import { routes } from "@/lib/routes";
import type { ShopifyCollection } from "@/lib/shopify/queries";

type CollectionsSectionProps = {
  collections: ShopifyCollection[];
};

export function CollectionsSection({ collections }: CollectionsSectionProps) {
  if (collections.length === 0) return null;

  return (
    <GridSection className="pt-[10svh] pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) pb-[5svh] md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          Collections
        </h2>
      </div>

      {/* Sky rules between the cards continue the grid rather than boxing
          each card in its own border. */}
      <ul className="col-start-2 col-end-5 grid border-t border-sky md:col-end-9 md:grid-cols-3">
        {collections.map((collection) => (
          <li
            key={collection.id}
            className="border-b border-sky md:border-r md:last:border-r-0"
          >
            <Link
              href={routes.collection(collection.handle)}
              className="group block h-full py-[4svh]"
            >
              <div className="px-(--grid-gutter)">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-sky/20">
                  {collection.imageUrl && (
                    <Image
                      src={collection.imageUrl}
                      alt={collection.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
              </div>

              {/* Runs the full column width so it meets the vertical grid
                  lines, rather than stopping at the gutter. */}
              <div className="mt-[4svh] h-px bg-sky" />

              <div className="px-(--grid-gutter) pt-5">
                <h3 className="font-owners-narrow-bold text-[7vw] leading-[0.95] wrap-break-word uppercase md:text-[min(2.4vw,4svh)]">
                  {collection.title}
                </h3>

                {collection.description && (
                  <p className="font-archivo-light mt-3 line-clamp-3 text-[16px] leading-normal md:text-[18px]">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </GridSection>
  );
}
