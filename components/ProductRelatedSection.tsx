"use client";

import { useEffect, useMemo } from "react";
import { useDictionary } from "@/components/LocaleProvider";
import { ProductTabsCarousel } from "@/components/ProductTabsCarousel";
import {
  RECENTLY_VIEWED_MAX,
  readRecentlyViewedHandles,
  recordRecentlyViewed,
} from "@/lib/recently-viewed";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { useIsClient } from "@/lib/useIsClient";

type ProductRelatedSectionProps = {
  similar: ShopifyProduct[];
  allProducts: ShopifyProduct[];
  currentHandle: string;
};

/**
 * Similar products and recently viewed share one carousel, like the home
 * occasion picker. They stay separate tabs rather than one list: similar is
 * a recommendation (and the default, so those links are in the HTML);
 * recently viewed is personal history and only appears after hydration.
 */
export function ProductRelatedSection({
  similar,
  allProducts,
  currentHandle,
}: ProductRelatedSectionProps) {
  const dict = useDictionary();
  const isClient = useIsClient();

  useEffect(() => {
    recordRecentlyViewed(currentHandle);
  }, [currentHandle]);

  const recentlyViewed = useMemo(() => {
    if (!isClient) return [];

    const byHandle = new Map(
      allProducts.map((product) => [product.handle, product]),
    );

    return readRecentlyViewedHandles()
      .filter((handle) => handle !== currentHandle)
      .map((handle) => byHandle.get(handle))
      .filter((product): product is ShopifyProduct => product != null)
      .slice(0, RECENTLY_VIEWED_MAX);
  }, [isClient, allProducts, currentHandle]);

  const tabs = [
    similar.length > 0
      ? {
          id: "similar",
          label: dict.product.similar,
          products: similar,
          viewAllHref: routes.shop,
        }
      : null,
    recentlyViewed.length > 0
      ? {
          id: "recent",
          label: dict.shop.recentlyViewed,
          products: recentlyViewed,
        }
      : null,
  ].filter((tab) => tab !== null);

  if (tabs.length === 0) return null;

  return (
    <ProductTabsCarousel
      tabs={tabs}
      defaultTabId="similar"
      viewAllLabel={dict.common.seeEverything}
      soldOutLabel={dict.product.soldOut}
      prevLabel={dict.home.calendar.prev}
      nextLabel={dict.home.calendar.next}
    />
  );
}
