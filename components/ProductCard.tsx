import Image from "next/image";
import Link from "next/link";
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
      className={
        compact ? "group block h-full py-5" : "group block h-full py-[4svh]"
      }
    >
      <div className="px-(--grid-gutter)">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-sky/20">
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

      <div
        className={
          compact
            ? "mt-3 flex flex-col gap-1 px-(--grid-gutter)"
            : "mt-3 flex items-baseline justify-between gap-3 px-(--grid-gutter)"
        }
      >
        <h3 className="font-owners-medium text-[12px] uppercase tracking-wide md:text-[13px]">
          {product.title}
        </h3>
        <span className="font-archivo-light text-[12px] md:text-[13px]">
          {product.price}
        </span>
      </div>
    </Link>
  );
}
