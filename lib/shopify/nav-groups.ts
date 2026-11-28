import type { ShopifyCollection } from "@/lib/shopify/queries";

/**
 * The owners' six families (their text document, 26 November 2026, page 6:
 * "Nos produits — Tous les produits, puis les six familles de la carte"), each
 * a Shopify collection filled from the product type, some with the
 * sub-categories they listed. Names are the collections' titles in Shopify,
 * in English in every language, as the owners wrote them.
 *
 * A family or a sub-category with no product yet (Breads & Toast, Dips… until
 * the owners give their products those types) is left out of the menu, and
 * comes back by itself with its first product.
 */
export const SHOP_FAMILIES = [
  {
    handle: "cold-pressed-juice-drinks",
    children: ["cold-pressed-juice", "other-drinks"],
  },
  { handle: "daily-pots", children: ["sweet-pots", "salads", "dips"] },
  { handle: "breads-toast", children: ["bagels-sandwiches", "toasts"] },
  { handle: "desserts-sweets", children: [] },
  { handle: "healthy-snacks", children: [] },
  { handle: "grocery-pantry", children: [] },
] as const;

export type NavFamily = {
  collection: ShopifyCollection;
  children: ShopifyCollection[];
};

/** The families that have products, with their non-empty sub-categories. */
export function resolveFamilies(
  collections: readonly ShopifyCollection[],
): NavFamily[] {
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const filled = (handle: string) => {
    const collection = byHandle.get(handle);
    return collection?.hasProducts ? collection : null;
  };

  return SHOP_FAMILIES.flatMap((family) => {
    const collection = filled(family.handle);
    if (!collection) return [];
    const children = family.children.flatMap((handle) => {
      const child = filled(handle);
      return child ? [child] : [];
    });
    return [{ collection, children }];
  });
}
