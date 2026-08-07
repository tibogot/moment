"use client";

import { useDictionary } from "@/components/LocaleProvider";

import { useEffect, useState } from "react";
import { ProductRowSection } from "@/components/ProductRowSection";
import {
  RECENTLY_VIEWED_DISPLAY,
  readRecentlyViewedHandles,
  recordRecentlyViewed,
} from "@/lib/recently-viewed";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type RecentlyViewedSectionProps = {
  allProducts: ShopifyProduct[];
  currentHandle: string;
  className?: string;
};

export function RecentlyViewedSection({
  allProducts,
  currentHandle,
  className,
}: RecentlyViewedSectionProps) {
  const dict = useDictionary();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    recordRecentlyViewed(currentHandle);

    const byHandle = new Map(allProducts.map((product) => [product.handle, product]));
    const viewed = readRecentlyViewedHandles()
      .filter((handle) => handle !== currentHandle)
      .map((handle) => byHandle.get(handle))
      .filter((product): product is ShopifyProduct => product != null)
      .slice(0, RECENTLY_VIEWED_DISPLAY);

    setProducts(viewed);
  }, [allProducts, currentHandle]);

  if (products.length === 0) return null;

  return (
    <ProductRowSection
      title={dict.shop.recentlyViewed}
      products={products}
      className={cn("pt-[10svh] pb-[14svh]", className)}
    />
  );
}
