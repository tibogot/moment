import type { ShopifyProduct } from "@/lib/shopify/queries";

/**
 * Customer-facing shop filters, keyed to Shopify product tags.
 *
 * Occasion, type and diet are the three groups worth exposing. Temperature
 * (froid, frais, cold-brew) and internal tags (artisanal, traiteur, …) stay
 * in Shopify for SEO / ops and never appear here.
 *
 * Matching is normalised (case, accents, spaces) so `Végétarien` and
 * `vegetarien` hit the same chip.
 */
export const FILTER_GROUPS = {
  type: [
    "salade",
    "plat",
    "quiche",
    "soupe",
    "granola",
    "porridge",
    "jus",
    "limonade",
    "cafe",
    "snack",
    "cookie",
  ],
  diet: ["vegan", "vegetarien", "sans-gluten"],
  occasion: ["maison", "bureau", "evenements"],
} as const;

export type FilterGroup = keyof typeof FILTER_GROUPS;
export type FilterTag<G extends FilterGroup = FilterGroup> =
  (typeof FILTER_GROUPS)[G][number];

export type SelectedFilters = {
  [G in FilterGroup]: FilterTag<G>[];
};

export const EMPTY_FILTERS: SelectedFilters = {
  type: [],
  diet: [],
  occasion: [],
};

export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "-");
}

function productTagSet(product: ShopifyProduct): Set<string> {
  return new Set(product.tags.map(normalizeTag));
}

/** Tags from the catalogue that actually exist, so empty chips never render. */
export function presentTags<G extends FilterGroup>(
  products: ShopifyProduct[],
  group: G,
): FilterTag<G>[] {
  const present = new Set<string>();
  for (const product of products) {
    for (const tag of product.tags) present.add(normalizeTag(tag));
  }
  return FILTER_GROUPS[group].filter((tag) => present.has(tag));
}

export function hasActiveFilters(selected: SelectedFilters): boolean {
  return (
    selected.type.length > 0 ||
    selected.diet.length > 0 ||
    selected.occasion.length > 0
  );
}

/**
 * Type and occasion are OR within the group (salade or plat). Diet is AND
 * (vegan and sans-gluten) — a plate has to satisfy every diet chip.
 */
export function filterProducts(
  products: ShopifyProduct[],
  selected: SelectedFilters,
): ShopifyProduct[] {
  if (!hasActiveFilters(selected)) return products;

  return products.filter((product) => {
    const tags = productTagSet(product);

    if (
      selected.type.length > 0 &&
      !selected.type.some((tag) => tags.has(tag))
    ) {
      return false;
    }

    if (
      selected.occasion.length > 0 &&
      !selected.occasion.some((tag) => tags.has(tag))
    ) {
      return false;
    }

    if (selected.diet.some((tag) => !tags.has(tag))) return false;

    return true;
  });
}
