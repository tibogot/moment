"use client";

import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";

type ShopSearchGridProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
};

/**
 * The shop grid, narrowed by whatever the search panel submitted.
 *
 * `?q=` is read here, in the browser, rather than by the page: reading
 * `searchParams` on the server would make /shop render on every request in
 * three languages, for a filter over products the client already holds. The
 * page wraps this in a Suspense boundary whose fallback is the unfiltered grid,
 * so the prerendered HTML is the whole catalogue and the query applies on
 * hydration.
 */
export function ShopSearchGrid({ products, collections }: ShopSearchGridProps) {
  const query = useSearchParams().get("q") ?? "";

  return (
    <ProductGrid products={products} collections={collections} query={query} />
  );
}
