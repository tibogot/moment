"use client";

import { useDictionary } from "@/components/LocaleProvider";

import { useEffect, useMemo } from "react";
import { ProductRowSection } from "@/components/ProductRowSection";
import {
  RECENTLY_VIEWED_DISPLAY,
  readRecentlyViewedHandles,
  recordRecentlyViewed,
} from "@/lib/recently-viewed";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { useIsClient } from "@/lib/useIsClient";
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
  // The history lives in localStorage, so the server has nothing to render and
  // the first client pass must agree with it. This flips true after hydration.
  const isClient = useIsClient();

  // Recording is the side effect; it belongs in an effect. Reading is not — it
  // is derived state, and putting it through `setState` here would render the
  // row empty and then again with its contents on every product page.
  useEffect(() => {
    recordRecentlyViewed(currentHandle);
  }, [currentHandle]);

  const products = useMemo(() => {
    if (!isClient) return [];

    const byHandle = new Map(
      allProducts.map((product) => [product.handle, product]),
    );

    // The current product is in the history by now — it is the page we are on,
    // not something to send the visitor back to.
    return readRecentlyViewedHandles()
      .filter((handle) => handle !== currentHandle)
      .map((handle) => byHandle.get(handle))
      .filter((product): product is ShopifyProduct => product != null)
      .slice(0, RECENTLY_VIEWED_DISPLAY);
  }, [isClient, allProducts, currentHandle]);

  if (products.length === 0) return null;

  return (
    <ProductRowSection
      title={dict.shop.recentlyViewed}
      viewAllLabel={dict.common.seeEverything}
      soldOutLabel={dict.product.soldOut}
      products={products}
      className={cn("pt-[10svh] pb-[14svh]", className)}
    />
  );
}
