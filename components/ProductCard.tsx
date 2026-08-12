import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { CSSProperties, MouseEvent } from "react";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";

type ProductCardProps = {
  product: ShopifyProduct;
  /** Feeds the `sizes` hint; matches the shop grid's column count. */
  sizes?: string;
  /** Tighter padding for overlays like search. */
  compact?: boolean;
  /**
   * Passed in rather than read from the dictionary: this card renders on both
   * sides of the client boundary, and a hook here would make every product grid
   * a client component to translate two words.
   */
  soldOutLabel: string;
  /**
   * What the title is, structurally. A heading on the pages where the card is
   * content — the shop grid, the product rows — under the section heading
   * above it. `span` where the card sits in an overlay that is mounted on
   * every page: those titles are not part of any page's outline, and rendering
   * them as h3 puts four of them, with nothing above them to nest under, into
   * the heading structure of the whole site.
   */
  titleAs?: "h2" | "h3" | "span";
  onNavigate?: () => void;
  /**
   * Receives the click before navigation. Return or `preventDefault` to cancel
   * — used by drag carousels so a swipe does not open the product.
   */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Every metric that changes between the shop's two views — padding, gutter,
 * type size — is read from a registered custom property rather than a utility
 * class, so switching view interpolates them instead of snapping. The 4:5
 * ratio is deliberately constant: the card resizes without re-cropping.
 */
export function ProductCard({
  product,
  sizes = "(max-width: 768px) 50vw, 33vw",
  compact = false,
  soldOutLabel,
  titleAs: Title = "h3",
  onNavigate,
  onClick,
}: ProductCardProps) {
  // LocaleLink is a Client Component. Passing a function from a Server
  // Component (the similar-products row on this page) is illegal — even a
  // no-op. Only attach a handler when a client parent actually supplied one.
  const handleClick =
    onClick || onNavigate
      ? (event: MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onNavigate?.();
        }
      : undefined;

  return (
    <Link
      href={routes.product(product.handle)}
      onClick={handleClick}
      className="group block h-full py-(--card-pad)"
      style={compact ? ({ "--card-pad": "1.25rem" } as CSSProperties) : undefined}
    >
      <div className="px-(--card-gutter)">
        <div className="product-card__image relative aspect-4/5 w-full overflow-hidden">
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
        </div>
      </div>

      {/* Wrapping rather than a breakpoint switch: as the card narrows the
          price drops under the title on its own, mid-flip, instead of the
          whole row changing direction in a single frame. */}
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-(--card-gutter)">
        {/* Both are flex items here, so blockified either way: the element
            changes what the title *is*, never how it sits. */}
        <Title className="font-owners-medium text-(length:--card-type) uppercase tracking-wide">
          {product.title}
        </Title>
        <span className="font-archivo-light text-(length:--card-price)">
          {product.price}
        </span>
      </div>
    </Link>
  );
}
