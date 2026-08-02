import Image from "next/image";
import Link from "next/link";
import { GridSection } from "@/components/GridSection";
import { routes } from "@/lib/routes";
import type { ShopifyCollection } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type CollectionsSectionProps = {
  collections: ShopifyCollection[];
  /** When false, skip the section title and "View all" link (e.g. on /collections). */
  showHeader?: boolean;
  className?: string;
};

export function CollectionsSection({
  collections,
  showHeader = true,
  className,
}: CollectionsSectionProps) {
  if (collections.length === 0) return null;

  return (
    <GridSection
      className={cn(
        showHeader ? "pt-[10svh] pb-0 md:pb-[14svh]" : "pb-[14svh]",
        className,
      )}
    >
      {showHeader && (
        <div className="col-start-2 col-end-5 flex flex-col items-start gap-4 px-(--grid-gutter) pb-[5svh] md:col-end-9 md:flex-row md:items-end md:justify-between">
          <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
            Collections
          </h2>

          <Link
            href={routes.collections}
            className="group inline-block border border-sky bg-cream px-3 py-2.5 transition-colors duration-500 hover:bg-sky"
          >
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
              View all
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </Link>
        </div>
      )}

      {/* The rules that open and close the block run the full viewport, like
          the ones above the intro and the calendar. Padding rather than column
          placement keeps the cards on the grid while the borders sit outside
          it, so they reach the edges. */}
      <div className="col-span-full border-t border-sky px-(--grid-margin) md:border-y">
        {/* Title sits above a two-row subgrid (rule + image) so the divider
            and image still line up across columns. */}
        <ul className="grid md:grid-cols-3 md:grid-rows-[auto_auto]">
          {collections.flatMap((collection, index) => {
            const items = [];

            if (index > 0 && index % 3 === 0) {
              items.push(
                <li
                  key={`row-divider-${index}`}
                  className="col-span-full hidden h-px list-none bg-sky md:block"
                  aria-hidden
                />,
              );
            }

            items.push(
              <li
                key={collection.id}
                className="collection-card group -mx-(--grid-margin) border-b border-sky px-(--grid-margin) transition-colors duration-500 last:border-b-0 md:mx-0 md:row-span-2 md:grid md:grid-rows-subgrid md:border-r md:border-b-0 md:px-0 md:last:border-r-0"
              >
                <Link
                  href={routes.collection(collection.handle)}
                  className="block md:contents"
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
                  <div className="collection-card__rule h-px" />

                  <div className="px-(--grid-gutter) pt-[2.5svh] pb-[1.5svh] md:pt-[4svh] md:pb-[2.5svh]">
                    <div className="collection-card__image relative aspect-4/3 w-full overflow-hidden">
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
              </li>,
            );

            return items;
          })}
        </ul>
      </div>
    </GridSection>
  );
}
