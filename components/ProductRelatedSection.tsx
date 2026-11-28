"use client";

import { useEffect, useMemo } from "react";
import { useDictionary } from "@/components/LocaleProvider";
import { ProductCarouselCells } from "@/components/v2/ProductCarouselCells";
import {
  RECENTLY_VIEWED_MAX,
  readRecentlyViewedHandles,
  recordRecentlyViewed,
} from "@/lib/recently-viewed";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { useIsClient } from "@/lib/hooks/useIsClient";

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
 *
 * The home's carousel on the 16 / 12 / 4 grid since 28 November 2026 (the
 * same cards as the home and the shop, ProductCell). Must sit in a `.v2`.
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
    <ProductCarouselCells
      tabs={tabs}
      defaultTabId={tabs[0].id}
      shopLink={{ href: routes.shop, label: dict.home.moments.shop }}
      soldOutLabel={dict.product.soldOut}
      prevLabel={dict.home.calendar.prev}
      nextLabel={dict.home.calendar.next}
    />
  );
}
