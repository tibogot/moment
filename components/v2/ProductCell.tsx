import type { MouseEvent } from "react";
import { CdnImage as Image } from "@/components/CdnImage";
import { DietBadges, type DietLabels } from "@/components/DietBadges";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";

type ProductCellProps = {
  product: ShopifyProduct;
  soldOutLabel: string;
  dietLabels: DietLabels;
  /** The `sizes` hint for the photo, from the card's width in its grid. */
  sizes: string;
  /** Receives the click first — the carousel cancels it after a drag. */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * A product on the page's 16 / 12 / 4 grid (28 November 2026, from the home's
 * carousel, where it was born): a title row one cell high — name, a few
 * words, the price — then the photo in the rows under it, inset by the cell
 * padding. The card is as many cells wide and rows tall as its parent makes
 * it; it draws its own rules, centred on the grid lines (under the title,
 * along its right edge and its bottom), so it can move — in the carousel —
 * or re-column — in the shop — and keep them.
 *
 * Render it inside an element with the `collection-card group relative`
 * classes (the sky fill on hover, globals.css). The title size is
 * `--card-title`, which the parent sets: the shop tweens it between its two
 * views. `.product-cell__words` is hidden in the shop's index view.
 */
export function ProductCell({
  product,
  soldOutLabel,
  dietLabels,
  sizes,
  onClick,
}: ProductCellProps) {
  return (
    <>
      <Link
        href={routes.product(product.handle)}
        onClick={onClick}
        className="flex h-full flex-col"
      >
        {/* Title row: one cell high. */}
        <div className="flex h-(--s-cell-h) shrink-0 flex-col justify-between overflow-hidden p-(--v2-pad)">
          <div className="min-w-0">
            <h3 className="font-owners-narrow-bold line-clamp-2 text-(length:--card-title) leading-[0.95] uppercase">
              {product.title}
            </h3>
            {/* A few words under the title: the product's "Accroche"
                (custom.short_description), else the start of its
                description, on one line. */}
            <p className="product-cell__words font-archivo-light mt-1.5 truncate text-[15px] leading-tight">
              {product.shortDescription || product.description}
            </p>
          </div>
          <span className="font-archivo-light text-[15px]">
            {product.displayPrice}
          </span>
        </div>
        {/* The photo: the rows under the title, inset by the cell's padding.
            (Edge to edge was tried on 25 November 2026.) */}
        <div className="min-h-0 flex-1 p-(--v2-pad)">
          <div className="collection-card__image relative h-full w-full overflow-hidden">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes={sizes}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            )}
            {!product.availableForSale && (
              <span className="font-owners-medium absolute top-3 left-3 bg-cream px-2 py-1 text-[10px] uppercase">
                {soldOutLabel}
              </span>
            )}
            <DietBadges
              tags={product.tags ?? []}
              labels={dietLabels}
              className="absolute bottom-3 left-3"
            />
          </div>
        </div>
      </Link>
      {/* The card's rules, centred on the lines like the grid's: under the
          title, on its right edge, along its bottom. */}
      <span
        aria-hidden
        className="collection-card__rule pointer-events-none absolute inset-x-0 h-(--grid-line) -translate-y-1/2"
        style={{ top: "var(--s-cell-h)" }}
      />
      <span
        aria-hidden
        className="collection-card__rule pointer-events-none absolute inset-y-0 right-0 w-(--grid-line) translate-x-1/2"
      />
      <span
        aria-hidden
        className="collection-card__rule pointer-events-none absolute inset-x-0 bottom-0 h-(--grid-line) translate-y-1/2"
      />
    </>
  );
}
