import Link from "next/link";
import { GridSection } from "@/components/GridSection";
import { ProductCard } from "@/components/ProductCard";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type ProductRowSectionProps = {
  title: string;
  products: ShopifyProduct[];
  viewAllHref?: string;
  className?: string;
};

export function ProductRowSection({
  title,
  products,
  viewAllHref,
  className,
}: ProductRowSectionProps) {
  if (products.length === 0) return null;

  return (
    <GridSection className={cn("pt-[10svh] pb-[14svh]", className)}>
      <div className="col-start-2 col-end-5 flex flex-col items-start gap-4 px-(--grid-gutter) pb-[5svh] md:col-end-9 md:flex-row md:items-end md:justify-between">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          {title}
        </h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
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
        )}
      </div>

      <ul className="product-list col-start-2 col-end-5 grid grid-cols-2 border-t border-r border-sky md:col-end-9 md:grid-cols-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="product-card border-b border-l border-sky transition-colors duration-500"
          >
            <ProductCard
              product={product}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </li>
        ))}
      </ul>
    </GridSection>
  );
}
