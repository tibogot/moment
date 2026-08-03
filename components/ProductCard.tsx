import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";

type ProductCardProps = {
  product: ShopifyProduct;
  /** Feeds the `sizes` hint; matches the shop grid's column count. */
  sizes?: string;
  /** Tighter padding for overlays like search. */
  compact?: boolean;
  onNavigate?: () => void;
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
  onNavigate,
}: ProductCardProps) {
  return (
    <Link
      href={routes.product(product.handle)}
      onClick={onNavigate}
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
              Sold out
            </span>
          )}
        </div>
      </div>

      {/* Wrapping rather than a breakpoint switch: as the card narrows the
          price drops under the title on its own, mid-flip, instead of the
          whole row changing direction in a single frame. */}
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-(--card-gutter)">
        <h3 className="font-owners-medium text-(length:--card-type) uppercase tracking-wide">
          {product.title}
        </h3>
        <span className="font-archivo-light text-(length:--card-price)">
          {product.price}
        </span>
      </div>
    </Link>
  );
}
