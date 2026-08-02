import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/lib/shopify/queries";

type ProductGridProps = {
  products: ShopifyProduct[];
  emptyMessage?: string;
};

/**
 * Product catalogue on a ruled grid — same border logic as the calendar and
 * collections sections so the sky lines run edge to edge.
 */
export function ProductGrid({
  products,
  emptyMessage = "The catalogue is not available right now. Please try again later.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-start-2 col-end-5 border-t border-sky px-(--grid-gutter) py-[6svh] md:col-end-9">
        <p className="font-archivo-light text-[15px]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="col-start-2 col-end-5 grid grid-cols-2 border-t border-r border-sky md:col-end-9 md:grid-cols-3">
      {products.map((product) => (
        <li key={product.id} className="product-card border-b border-l border-sky transition-colors duration-500">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
