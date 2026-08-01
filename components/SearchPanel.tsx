"use client";

import { useRouter } from "next/navigation";
import {
  FormEvent,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "@/lib/gsapConfig";
import { GridLines } from "@/components/GridLines";
import { ProductCard } from "@/components/ProductCard";
import { routes } from "@/lib/routes";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type SearchPanelProps = {
  open: boolean;
  onClose: () => void;
  products?: ShopifyProduct[];
};

const ANIM_DURATION = 0.75;
const OPEN_EASE = "power3.out";
const CLOSE_EASE = "power3.inOut";
const POPULAR_COUNT = 4;
const LIVE_RESULTS_COUNT = 8;

/** Curated until search analytics land. */
const POPULAR_SEARCHES = [
  "Plates",
  "Salads",
  "Juices",
  "Coffee",
  "Granola",
  "Catering",
] as const;

function matchesQuery(product: ShopifyProduct, query: string) {
  const q = query.toLowerCase();
  return (
    product.title.toLowerCase().includes(q) ||
    product.productType.toLowerCase().includes(q) ||
    product.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    product.description.toLowerCase().includes(q)
  );
}

export function SearchPanel({
  open,
  onClose,
  products = [],
}: SearchPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());

  useOverlayScrollLock(open);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    gsap.set(panel, { yPercent: -100, visibility: "visible" });
    gsap.set(backdrop, { autoAlpha: 0, visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const ease = open ? OPEN_EASE : CLOSE_EASE;
    const tl = gsap.timeline({
      defaults: { duration: ANIM_DURATION, ease, overwrite: "auto" },
      onComplete: () => {
        if (open) inputRef.current?.focus();
      },
    });

    if (open) {
      tl.to(backdrop, { autoAlpha: 1, duration: ANIM_DURATION * 0.85 }, 0);
      tl.to(panel, { yPercent: 0 }, 0);
    } else {
      tl.to(panel, { yPercent: -100 }, 0);
      tl.to(backdrop, { autoAlpha: 0, duration: ANIM_DURATION * 0.7 }, 0.05);
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  const isSearching = deferredQuery.length > 0;

  const visibleProducts = useMemo(() => {
    if (!isSearching) return products.slice(0, POPULAR_COUNT);

    return products
      .filter((product) => matchesQuery(product, deferredQuery))
      .slice(0, LIVE_RESULTS_COUNT);
  }, [deferredQuery, isSearching, products]);

  const runSearch = (value: string) => {
    const trimmed = value.trim();
    onClose();
    if (!trimmed) return;
    router.push(`${routes.shop}?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  return (
    <>
      <div
        ref={backdropRef}
        data-overlay-backdrop
        className="pointer-events-none fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      <div
        ref={panelRef}
        data-overlay-panel
        className="fixed inset-x-0 top-0 z-50 max-h-svh overflow-y-auto bg-cream text-black"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        aria-hidden={!open}
        inert={!open}
        data-lenis-prevent
      >
        <GridLines lineClassName="bg-sky" />

        <div
          className="relative grid"
          style={{ gridTemplateColumns: "var(--grid-columns)" }}
        >
          {/* Full-bleed rule under a band the same height as the navbar. */}
          <div className="col-span-full">
            <div
              className="grid min-h-(--grid-band) items-center"
              style={{ gridTemplateColumns: "var(--grid-columns)" }}
            >
              <div className="col-start-2 col-end-5 flex items-center justify-between px-(--grid-gutter) md:col-end-9">
                <p className="font-owners-medium text-[12px] uppercase tracking-wide md:text-(length:--nav-text)">
                  Search
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60 md:text-(length:--nav-text)"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="h-px bg-sky" aria-hidden />
          </div>

          <form
            onSubmit={handleSubmit}
            className="col-start-2 col-end-5 px-(--grid-gutter) py-[5svh] md:col-end-9"
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              autoComplete="off"
              className="font-owners-narrow-bold w-full border-b border-sky bg-transparent pb-4 text-[8vw] leading-[1.05] text-black uppercase outline-none placeholder:text-black/25 md:text-[min(4.5vw,4.5rem)]"
            />
          </form>

          {/* Full-bleed rule above the popular block — one line, not per-column. */}
          <div className="col-span-full h-px bg-sky" aria-hidden />

          {/*
            Prefer h-px / w-px rules over stacking border-b + border-t — two
            1px sky borders on the same edge read as a thick near-black line.
            self-start: don't stretch to the products row height.
          */}
          <div className="relative col-start-2 col-end-5 self-start px-(--grid-gutter) pt-[4svh] pb-[4svh] md:col-end-4">
            <p className="font-owners-medium text-[11px] uppercase tracking-wide">
              Popular searches
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {POPULAR_SEARCHES.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      inputRef.current?.focus();
                    }}
                    className="font-owners-medium text-[13px] uppercase tracking-wide transition-opacity hover:opacity-60"
                  >
                    {term}
                  </button>
                </li>
              ))}
            </ul>
            {/* Mobile-only closer — on desktop the panel bottom rule is enough
                and a second line under this short column reads as a double. */}
            <div className="mt-[4svh] h-px bg-sky md:hidden" aria-hidden />
          </div>

          <div className="relative col-start-2 col-end-5 md:col-start-4 md:col-end-9">
            {/* Outer verticals live in the content layer — GridLines sit behind
                the cream cells so the product box needs its own L/R rules. */}
            <span
              className="pointer-events-none absolute inset-y-0 left-0 w-px bg-sky"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-0 w-px bg-sky"
              aria-hidden
            />

            <div className="px-(--grid-gutter) pt-[4svh] pb-4">
              <p className="font-owners-medium text-[11px] uppercase tracking-wide">
                {isSearching ? "Results" : "Popular products"}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="px-(--grid-gutter) pb-8">
                <div className="mb-6 h-px bg-sky" aria-hidden />
                <p className="font-archivo-light text-[14px]">
                  Products will appear here once the catalogue is connected.
                </p>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="px-(--grid-gutter) pb-8">
                <div className="mb-6 h-px bg-sky" aria-hidden />
                <p className="font-archivo-light text-[14px]">
                  No products match “{deferredQuery}”.
                </p>
              </div>
            ) : (
              <>
                {/*
                  gap-px draws interior rules only. Left/right edges are the
                  absolute spines above — never border-l + neighbour border-r.
                */}
                <div className="h-px bg-sky" aria-hidden />
                <ul className="grid grid-cols-2 gap-px bg-sky md:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <li key={product.id} className="bg-cream">
                      <ProductCard
                        product={product}
                        compact
                        sizes="(max-width: 768px) 50vw, 20vw"
                        onNavigate={onClose}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Full-bleed closer + bottom band — single h-px, not a border-t. */}
          <div className="col-span-full h-px bg-sky" aria-hidden />
          <div className="col-span-full min-h-(--grid-band)" />
        </div>
      </div>
    </>
  );
}
