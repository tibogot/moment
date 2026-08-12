"use client";

import { useDictionary } from "@/components/LocaleProvider";

import { LocaleLink as Link } from "@/components/LocaleLink";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ProductCard } from "@/components/ProductCard";
import { gsap } from "@/lib/gsapConfig";
import { loadFlip, type FlipType } from "@/lib/gsapFlip";
import { routes } from "@/lib/routes";
import {
  EMPTY_FILTERS,
  filterProducts,
  hasActiveFilters,
  presentTags,
  type FilterGroup,
  type FilterTag,
  type SelectedFilters,
} from "@/lib/shopify/filters";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type AccordionId = FilterGroup | "sort";
type View = "grid" | "index";
type Sort = "featured" | "priceAsc" | "priceDesc" | "titleAsc";

const sorts = [
  "featured",
  "priceAsc",
  "priceDesc",
  "titleAsc",
] as const satisfies readonly Sort[];

function sortProducts(
  products: ShopifyProduct[],
  sort: Sort,
): ShopifyProduct[] {
  if (sort === "featured") return products;

  return [...products].sort((a, b) => {
    if (sort === "titleAsc") {
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }

    const delta = Number(a.priceAmount) - Number(b.priceAmount);
    return sort === "priceAsc" ? delta : -delta;
  });
}

const views = [
  { id: "grid", label: "Grid", cells: 2 },
  { id: "index", label: "Index", cells: 3 },
] as const satisfies readonly { id: View; label: string; cells: number }[];

/**
 * Index runs on the page's own column count — 3 on mobile, 7 above md — so the
 * card borders land exactly on the grid lines the rest of the site is ruled
 * to. Everything else about the card is identical between the two.
 */
const columns: Record<View, string> = {
  grid: "grid-cols-2 md:grid-cols-3",
  index: "grid-cols-3 md:grid-cols-7",
};

const DURATION = 0.75;
const EASE = "power3.inOut";

/** The card metrics that differ between the two views — see globals.css. */
const CARD_VARS = [
  "--card-pad",
  "--card-gutter",
  "--card-type",
  "--card-price",
] as const;

type CardVars = Record<(typeof CARD_VARS)[number], string>;

/**
 * Because the properties are registered as `<length>`, the computed value is
 * resolved to px — so `max(0.75rem, 3.5vw)` reads back as something tweenable.
 * Anything else means `@property` isn't supported here; the caller then leaves
 * the metrics to switch on their own rather than animating garbage.
 */
function readCardVars(element: Element): CardVars | null {
  const styles = getComputedStyle(element);
  const vars = {} as CardVars;

  for (const name of CARD_VARS) {
    const value = styles.getPropertyValue(name).trim();
    if (!/^-?[\d.]+px$/.test(value)) return null;
    vars[name] = value;
  }

  return vars;
}

type ProductGridProps = {
  products: ShopifyProduct[];
  emptyMessage?: string;
  /**
   * Rendered as filter links to the left of the view toggle. Passed as data
   * rather than markup: an element handed across the server/client boundary
   * loses the validation React uses to know it isn't an unkeyed list item.
   */
  collections?: ShopifyCollection[];
};

/**
 * Product catalogue on a ruled grid — same border logic as the calendar and
 * collections sections so the sky lines run edge to edge. The view toggle
 * re-columns the list and Flip tweens every card from its old cell to its new
 * one, so the grid visibly redraws itself rather than snapping.
 */
export function ProductGrid({
  products,
  emptyMessage,
  collections = [],
}: ProductGridProps) {
  const dict = useDictionary();
  // Falls back to the dictionary rather than defaulting in the signature: a
  // default parameter cannot read a hook.
  const emptyText = emptyMessage ?? dict.shop.unavailable;
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<Sort>("featured");
  const [filters, setFilters] = useState<SelectedFilters>(EMPTY_FILTERS);
  const [openGroups, setOpenGroups] = useState<AccordionId[]>([]);
  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort],
  );
  const filterKey = [
    filters.type.join(","),
    filters.diet.join(","),
    filters.occasion.join(","),
  ].join("|");
  const typeTags = useMemo(() => presentTags(products, "type"), [products]);
  const dietTags = useMemo(() => presentTags(products, "diet"), [products]);
  const occasionTags = useMemo(
    () => presentTags(products, "occasion"),
    [products],
  );
  const listRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  /** Captured in the click handler — Flip needs the layout before React re-renders. */
  const stateRef = useRef<ReturnType<
    (typeof FlipType)["getState"]
  > | null>(null);
  const heightRef = useRef(0);
  const cardVarsRef = useRef<CardVars | null>(null);
  const flipRef = useRef<gsap.core.Timeline | null>(null);
  /*
   * The toggle captures state synchronously, before React re-renders, so Flip
   * has to already be here when it is clicked — it cannot be awaited at that
   * point. Fetched on mount rather than statically imported so it stays out of
   * the chunk every other route loads; this is the shop, where it is certain to
   * be wanted. See lib/gsapFlip.ts.
   */
  const flipModuleRef = useRef<typeof FlipType | null>(null);

  useEffect(() => {
    loadFlip().then((Flip) => {
      flipModuleRef.current = Flip;
    });
  }, []);

  const captureLayout = () => {
    const list = listRef.current;
    const wrapper = wrapperRef.current;
    const Flip = flipModuleRef.current;
    if (!list || !wrapper) return;

    stateRef.current = Flip ? Flip.getState(list.children) : null;
    heightRef.current = wrapper.offsetHeight;
    cardVarsRef.current = readCardVars(list);
  };

  const selectView = (next: View) => {
    if (next === view) return;
    captureLayout();
    setView(next);
  };

  const selectSort = (next: Sort) => {
    if (next === sort) return;
    captureLayout();
    setSort(next);
  };

  const toggleGroup = (group: AccordionId) => {
    setOpenGroups((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    );
  };

  const toggleFilter = <G extends FilterGroup>(
    group: G,
    tag: FilterTag<G>,
  ) => {
    captureLayout();
    setFilters((current) => {
      const selected = current[group].includes(tag)
        ? current[group].filter((item) => item !== tag)
        : [...current[group], tag];
      return { ...current, [group]: selected };
    });
  };

  useGSAP(
    () => {
      const state = stateRef.current;
      const list = listRef.current;
      const wrapper = wrapperRef.current;
      const varsFrom = cardVarsRef.current;
      const Flip = flipModuleRef.current;
      stateRef.current = null;
      cardVarsRef.current = null;
      if (!state || !list || !wrapper || !Flip) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Everything is measured before a single tween starts, while the DOM is
      // sitting in its true destination layout — new columns, new card
      // metrics. Read it after animating and the numbers describe a layout
      // that is half way to somewhere else.
      const varsTo = readCardVars(list);
      const heightTo = wrapper.offsetHeight;
      const heightFrom = heightRef.current;

      // The captured state already holds the in-flight positions, so killing
      // the previous run here reads as continuous rather than as a snap.
      flipRef.current?.kill();

      flipRef.current = Flip.from(state, {
        duration: DURATION,
        ease: EASE,
        stagger: { amount: 0.2, from: "start" },
      });

      // Flip has its target now, so the card metrics can be sent back to where
      // they started and tweened forward alongside it. The cards are explicitly
      // sized for the length of the flip, so this only affects what's inside
      // them; it can't move the destination out from under the tween.
      if (varsFrom && varsTo) {
        gsap.fromTo(list, varsFrom, {
          ...varsTo,
          duration: DURATION,
          ease: EASE,
          overwrite: true,
          // Hand the properties back to the stylesheet, which holds the same
          // values — a breakpoint change would otherwise be stuck on the px
          // this run resolved.
          onComplete: () => {
            for (const name of CARD_VARS) list.style.removeProperty(name);
          },
        });
      }

      // The cards leave their old rows the moment React re-renders, so the
      // page below would jump a full grid height while they are still moving.
      // The wrapper carries that change at the same pace; overflow stays
      // visible so nothing clips while the list is taller than its box.
      if (heightFrom && heightTo && heightFrom !== heightTo) {
        gsap.fromTo(
          wrapper,
          { height: heightFrom },
          {
            height: heightTo,
            duration: DURATION,
            ease: EASE,
            clearProps: "height",
            overwrite: true,
          },
        );
      }
    },
    { dependencies: [view, sort, filterKey] },
  );

  if (products.length === 0) {
    return (
      <div className="col-start-2 col-end-5 border-t border-sky px-(--grid-gutter) py-[6svh] md:col-end-9">
        <p className="font-archivo-light text-[15px]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="col-start-2 col-end-5 md:col-end-9">
      <div className="flex flex-col gap-4 border-t border-sky px-(--grid-gutter) py-[4svh]">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1 md:max-w-md">
            <ul>
              <FilterAccordion
                group="type"
                label={dict.shop.filters.type}
                tags={typeTags}
                selected={filters.type}
                labels={dict.shop.filters.tags}
                open={openGroups.includes("type")}
                onToggleOpen={() => toggleGroup("type")}
                onToggleTag={(tag) => toggleFilter("type", tag)}
              />
              <FilterAccordion
                group="diet"
                label={dict.shop.filters.diet}
                tags={dietTags}
                selected={filters.diet}
                labels={dict.shop.filters.tags}
                open={openGroups.includes("diet")}
                onToggleOpen={() => toggleGroup("diet")}
                onToggleTag={(tag) => toggleFilter("diet", tag)}
              />
              <FilterAccordion
                group="occasion"
                label={dict.shop.filters.occasion}
                tags={occasionTags}
                selected={filters.occasion}
                labels={dict.shop.filters.tags}
                open={openGroups.includes("occasion")}
                onToggleOpen={() => toggleGroup("occasion")}
                onToggleTag={(tag) => toggleFilter("occasion", tag)}
              />
            </ul>
            {collections.length > 0 &&
              typeTags.length === 0 &&
              dietTags.length === 0 &&
              occasionTags.length === 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {collections.map((collection) => (
                    <li key={collection.id}>
                      <Link
                        href={routes.collection(collection.handle)}
                        className="animated-underline font-owners-medium text-[12px] uppercase tracking-wide"
                      >
                        {collection.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          <div className="flex w-full shrink-0 flex-col items-stretch sm:w-56">
            <ul>
              <li className="border-b border-sky">
                <button
                  type="button"
                  aria-expanded={openGroups.includes("sort")}
                  aria-controls="shop-filter-sort"
                  onClick={() => toggleGroup("sort")}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left"
                >
                  <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                    {dict.shop.sort.label}
                  </span>
                  <span
                    className="font-owners-medium shrink-0 text-[14px] uppercase tracking-wide"
                    aria-hidden
                  >
                    {openGroups.includes("sort") ? "−" : "+"}
                  </span>
                </button>

                <div
                  id="shop-filter-sort"
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{
                    maxHeight: openGroups.includes("sort") ? "16rem" : "0",
                  }}
                >
                  <ul className="flex flex-col gap-y-2.5 pb-4">
                    {sorts.map((id) => {
                      const checked = sort === id;
                      return (
                        <li key={id}>
                          <label className="flex cursor-pointer items-center gap-2.5">
                            <input
                              type="radio"
                              name="shop-sort"
                              checked={checked}
                              onChange={() => selectSort(id)}
                              className="peer sr-only"
                            />
                            <span
                              aria-hidden
                              className={cn(
                                "size-3.5 shrink-0 border border-sky transition-colors duration-300",
                                checked && "bg-sky",
                              )}
                            />
                            <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                              {dict.shop.sort[id]}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            </ul>

            <div
              role="group"
              aria-label={dict.shop.layout}
              className="mt-4 flex self-end border border-sky bg-cream"
            >
              {views.map(({ id, label, cells }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => selectView(id)}
                  className={cn(
                    "font-owners-medium flex items-center gap-2 border-r border-sky px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 last:border-r-0",
                    view === id ? "bg-sky" : "hover:bg-sky/30",
                  )}
                >
                  <ViewGlyph cells={cells} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="font-archivo-light border-t border-sky px-(--grid-gutter) py-[6svh] text-[15px]">
          {hasActiveFilters(filters) ? dict.shop.filters.empty : emptyText}
        </p>
      ) : (
        <div ref={wrapperRef}>
          <ul
            ref={listRef}
            data-view={view}
            className={cn(
              "product-list grid border-t border-r border-sky",
              columns[view],
            )}
          >
            {visibleProducts.map((product) => (
              <li
                key={product.id}
                className="product-card border-b border-l border-sky transition-colors duration-500"
              >
                {/* `sizes` stays fixed across views on purpose: changing it would
                    swap the srcset candidate and flash the image mid-flip. */}
                <ProductCard
                  product={product}
                  soldOutLabel={dict.product.soldOut}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** A miniature of the grid the button switches to. */
function ViewGlyph({ cells }: { cells: number }) {
  return (
    <span
      aria-hidden
      className="grid size-2.75 gap-px"
      style={{ gridTemplateColumns: `repeat(${cells}, 1fr)` }}
    >
      {Array.from({ length: cells * cells }, (_, index) => (
        <span key={index} className="bg-black" />
      ))}
    </span>
  );
}

function FilterAccordion<G extends FilterGroup>({
  group,
  label,
  tags,
  selected,
  labels,
  open,
  onToggleOpen,
  onToggleTag,
}: {
  group: G;
  label: string;
  tags: FilterTag<G>[];
  selected: FilterTag<G>[];
  labels: Record<string, string>;
  open: boolean;
  onToggleOpen: () => void;
  onToggleTag: (tag: FilterTag<G>) => void;
}) {
  if (tags.length === 0) return null;

  const panelId = `shop-filter-${group}`;

  return (
    <li className="border-b border-sky">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggleOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left"
      >
        <span className="font-owners-medium text-[12px] uppercase tracking-wide">
          {label}
          {selected.length > 0 ? ` (${selected.length})` : ""}
        </span>
        <span
          className="font-owners-medium shrink-0 text-[14px] uppercase tracking-wide"
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        id={panelId}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? "24rem" : "0" }}
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 pb-4">
          {tags.map((tag) => {
            const checked = selected.includes(tag);
            return (
              <li key={tag}>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTag(tag)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "size-3.5 shrink-0 border border-sky transition-colors duration-300",
                      checked && "bg-sky",
                    )}
                  />
                  <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                    {labels[tag] ?? tag}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
