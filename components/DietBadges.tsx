import { normalizeTag } from "@/lib/shopify/filters";
import { cn } from "@/lib/utils";

export type DietLabels = {
  vegan: string;
  vegetarien: string;
  "sans-gluten": string;
};

type DietBadgesProps = {
  tags: readonly string[];
  /**
   * Passed in, not read from the dictionary: the cards that show these render
   * on both sides of the client boundary (see ProductCard's `soldOutLabel`).
   */
  labels: DietLabels;
  className?: string;
};

/**
 * The diet at a glance on a product card (26 November 2026): "Vegan",
 * "Végétarien", "Sans gluten" — from the product's Shopify tags, the same ones
 * the shop's filters use, so a badge and a filter can never disagree. Tartes.be
 * shows them on every card; here they were only on the product page.
 *
 * Vegan implies vegetarian, so a vegan product shows "Vegan" alone.
 */
export function DietBadges({ tags, labels, className }: DietBadgesProps) {
  const set = new Set(tags.map(normalizeTag));
  const badges = [
    set.has("vegan")
      ? labels.vegan
      : set.has("vegetarien")
        ? labels.vegetarien
        : null,
    set.has("sans-gluten") ? labels["sans-gluten"] : null,
  ].filter((badge): badge is string => Boolean(badge));

  if (badges.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((badge) => (
        <li
          key={badge}
          className="font-owners-medium border border-sky bg-cream px-1.5 py-1 text-[10px] leading-none tracking-wide text-black uppercase"
        >
          {badge}
        </li>
      ))}
    </ul>
  );
}
