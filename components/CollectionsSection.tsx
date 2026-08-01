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

      {/* The rules that open and close the block run the full viewport, like
          the ones above the intro and the calendar. Padding rather than column
          placement keeps the cards on the grid while the borders sit outside
          it, so they reach the edges. */}
      <div className="col-span-full border-y border-sky px-(--grid-margin)">
        {/* Title sits above a two-row subgrid (rule + image) so the divider
            and image still line up across columns. */}
        <ul className="grid md:grid-cols-3 md:grid-rows-[auto_auto]">
          {collections.map((collection) => (
            <li
              key={collection.id}
              className="collection-card border-b border-sky last:border-b-0 md:row-span-2 md:grid md:grid-rows-subgrid md:border-r md:border-b-0 md:last:border-r-0"
            >
              <Link
                href={routes.collection(collection.handle)}
                className="group block md:contents"
              >
                <div className="px-(--grid-gutter) pt-[3svh] pb-[2svh] md:pt-[4svh] md:pb-[2.5svh]">
                  <h3 className="font-owners-narrow-bold text-[7vw] leading-[0.95] wrap-break-word uppercase md:text-[min(2.4vw,4svh)]">
                    {collection.title}
                  </h3>

                  {/* {collection.description && (
                    <p className="font-archivo-light mt-3 line-clamp-3 text-[16px] leading-normal md:text-[18px]">
                      {collection.description}
                    </p>
                  )} */}
                </div>

                {/* Runs the full column width so it meets the vertical grid
                    lines, rather than stopping at the gutter. */}
                <div className="h-px bg-sky" />

                <div className="px-(--grid-gutter) pt-[2.5svh] pb-[1.5svh] md:pt-[4svh] md:pb-[2.5svh]">
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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </GridSection>
  );
}
