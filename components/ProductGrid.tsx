"use client";

import { useDictionary } from "@/components/LocaleProvider";

import { LocaleLink as Link } from "@/components/LocaleLink";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ProductCard } from "@/components/ProductCard";
import { gsap } from "@/lib/gsapConfig";
import { loadFlip, type FlipType } from "@/lib/gsapFlip";
import { routes } from "@/lib/routes";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type View = "grid" | "index";

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

  const selectView = (next: View) => {
    const list = listRef.current;
    const wrapper = wrapperRef.current;
    const Flip = flipModuleRef.current;
    if (next === view || !list || !wrapper) return;

    // Not loaded yet — re-column without the tween rather than not at all.
    stateRef.current = Flip ? Flip.getState(list.children) : null;
    heightRef.current = wrapper.offsetHeight;
    cardVarsRef.current = readCardVars(list);
    setView(next);
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
    { dependencies: [view] },
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
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-sky px-(--grid-gutter) py-[4svh]">
        {/* The empty list still renders, so the toggle stays hard right. */}
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

        <div
          role="group"
          aria-label={dict.shop.layout}
          className="flex shrink-0 border border-sky bg-cream"
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

      <div ref={wrapperRef}>
        <ul
          ref={listRef}
          data-view={view}
          className={cn(
            "product-list grid border-t border-r border-sky",
            columns[view],
          )}
        >
          {products.map((product) => (
            <li
              key={product.id}
              className="product-card border-b border-l border-sky transition-colors duration-500"
            >
              {/* `sizes` stays fixed across views on purpose: changing it would
                  swap the srcset candidate and flash the image mid-flip. */}
              <ProductCard product={product} soldOutLabel={dict.product.soldOut} />
            </li>
          ))}
        </ul>
      </div>
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
