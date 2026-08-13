"use client";

import { ProductTabsCarousel } from "@/components/ProductTabsCarousel";
import { routes } from "@/lib/routes";
import type { ShopifyCollection } from "@/lib/shopify/queries";

/** Matches `DEFAULT_SELECTION_HANDLE` in lib/shopify/collections.ts. */
const DEFAULT_HANDLE = "pour-la-maison";

type SelectionTab = {
  handle: string;
  label: string;
};

type SelectionCollectionsSectionProps = {
  collections: ShopifyCollection[];
  tabs: SelectionTab[];
  viewAllLabel: string;
  soldOutLabel: string;
  prevLabel: string;
  nextLabel: string;
  className?: string;
};

/**
 * Home occasion picker: three underlined text tabs (events / home / office)
 * above a product carousel — drag/swipe with inertia plus arrow buttons.
 */
export function SelectionCollectionsSection({
  collections,
  tabs,
  viewAllLabel,
  soldOutLabel,
  prevLabel,
  nextLabel,
  className,
}: SelectionCollectionsSectionProps) {
  const byHandle = new Map(
    collections.map((collection) => [collection.handle, collection]),
  );
  const carouselTabs = tabs
    .filter((tab) => byHandle.has(tab.handle))
    .map((tab) => ({
      id: tab.handle,
      label: tab.label,
      products: byHandle.get(tab.handle)?.products ?? [],
      viewAllHref: routes.collection(tab.handle),
    }));

  const defaultTabId = byHandle.has(DEFAULT_HANDLE)
    ? DEFAULT_HANDLE
    : carouselTabs[0]?.id;

  return (
    <ProductTabsCarousel
      tabs={carouselTabs}
      defaultTabId={defaultTabId}
      viewAllLabel={viewAllLabel}
      soldOutLabel={soldOutLabel}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      className={className}
    />
  );
}
