"use client";

import { useGSAP } from "@gsap/react";
import { useId, useRef, useState } from "react";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridSection } from "@/components/GridSection";
import { ProductCard } from "@/components/ProductCard";
import { gsap } from "@/lib/gsapConfig";
import {
  loadDraggable,
  timeSinceDrag,
  type DraggableInstance,
} from "@/lib/gsapDraggable";
import type { ShopifyProduct } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

export type ProductCarouselTab = {
  id: string;
  label: string;
  products: ShopifyProduct[];
  viewAllHref?: string;
};

type ProductTabsCarouselProps = {
  tabs: ProductCarouselTab[];
  viewAllLabel: string;
  soldOutLabel: string;
  prevLabel: string;
  nextLabel: string;
  defaultTabId?: string;
  className?: string;
};

/**
 * Tabbed product carousel: drag/swipe with inertia plus arrow buttons.
 * One tab renders as a heading so a lone list still has an outline; two or
 * more become a tablist, same pattern as the home occasion picker.
 */
export function ProductTabsCarousel({
  tabs,
  viewAllLabel,
  soldOutLabel,
  prevLabel,
  nextLabel,
  defaultTabId,
  className,
}: ProductTabsCarouselProps) {
  const reactId = useId();
  const panelId = `${reactId}-carousel`;

  const [activeId, setActiveId] = useState(
    () => defaultTabId ?? tabs[0]?.id ?? "",
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const productCount = active?.products.length ?? 0;
  const showTabs = tabs.length > 1;

  const syncScrollState = () => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const overflow = track.scrollWidth - viewport.clientWidth;
    const minX = overflow > 0 ? -overflow : 0;
    const currentX = Number(gsap.getProperty(track, "x") ?? 0);
    setCanScrollPrev(currentX < -4);
    setCanScrollNext(currentX > minX + 4);
  };

  useGSAP(
    () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport || productCount === 0) return;

      let cancelled = false;
      let draggable: DraggableInstance | null = null;
      let resizeObserver: ResizeObserver | null = null;

      const setCarouselWidth = () => {
        viewport.style.setProperty(
          "--product-carousel-width",
          `${viewport.clientWidth}px`,
        );
      };

      const getBounds = () => {
        const overflow = track.scrollWidth - viewport.clientWidth;
        return { minX: overflow > 0 ? -overflow : 0, maxX: 0 };
      };

      const syncBounds = () => {
        setCarouselWidth();
        const bounds = getBounds();
        draggable?.applyBounds(bounds);
        const currentX = Number(gsap.getProperty(track, "x") ?? 0);
        gsap.set(track, {
          x: gsap.utils.clamp(bounds.minX, bounds.maxX, currentX),
        });
        syncScrollState();
      };

      gsap.set(track, { x: 0 });
      setCarouselWidth();
      syncScrollState();

      loadDraggable().then((Draggable) => {
        if (cancelled) return;

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        draggable = Draggable.create(track, {
          type: "x",
          inertia: !reduceMotion,
          dragClickables: true,
          allowNativeTouchScrolling: true,
          edgeResistance: 0.85,
          cursor: "grab",
          activeCursor: "grabbing",
          bounds: getBounds(),
          onDrag: syncScrollState,
          onThrowUpdate: syncScrollState,
          onThrowComplete: syncScrollState,
          onDragEnd: syncScrollState,
        })[0];
        syncBounds();
      });

      const onResize = () => syncBounds();
      window.addEventListener("resize", onResize);
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(track);
      resizeObserver.observe(viewport);

      return () => {
        cancelled = true;
        window.removeEventListener("resize", onResize);
        resizeObserver?.disconnect();
        draggable?.kill();
        gsap.set(track, { clearProps: "transform" });
      };
    },
    {
      scope: containerRef,
      dependencies: [active?.id, productCount],
    },
  );

  if (tabs.length === 0 || !active) return null;

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const firstCard = track.querySelector<HTMLElement>("li");
    const distance = firstCard?.offsetWidth ?? viewport.clientWidth;
    const overflow = track.scrollWidth - viewport.clientWidth;
    const minX = overflow > 0 ? -overflow : 0;
    const currentX = Number(gsap.getProperty(track, "x") ?? 0);
    const target = gsap.utils.clamp(minX, 0, currentX + direction * distance);

    gsap.to(track, {
      x: target,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: syncScrollState,
      onComplete: syncScrollState,
    });
  };

  const headingClassName =
    "font-owners-medium text-[12px] uppercase tracking-wide";

  return (
    <GridSection className={cn("pt-[10svh] pb-[14svh]", className)}>
      <div className="col-start-2 col-end-5 flex flex-col items-start gap-4 px-(--grid-gutter) pb-[5svh] md:col-end-9 md:flex-row md:items-end md:justify-between">
        {showTabs ? (
          <ul
            className="flex flex-wrap gap-x-5 gap-y-2"
            role="tablist"
            aria-label={tabs.map((tab) => tab.label).join(", ")}
          >
            {tabs.map((tab) => {
              const selected = tab.id === active.id;
              return (
                <li key={tab.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={panelId}
                    id={`${reactId}-tab-${tab.id}`}
                    onClick={() => setActiveId(tab.id)}
                    className={cn(
                      "animated-underline cursor-pointer",
                      headingClassName,
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <h2 className={headingClassName}>{active.label}</h2>
        )}

        <div className="flex items-center gap-3">
          <div className="flex border border-sky bg-cream">
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollPrev}
              aria-label={prevLabel}
              className="font-owners-medium border-r border-sky px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 enabled:hover:bg-sky/30 disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollNext}
              aria-label={nextLabel}
              className="font-owners-medium px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 enabled:hover:bg-sky/30 disabled:opacity-30"
            >
              →
            </button>
          </div>

          {active.viewAllHref && (
            <Link
              href={active.viewAllHref}
              className="group inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
            >
              <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                {viewAllLabel}
                <span
                  className="transition-transform duration-500 group-hover:translate-x-1.5"
                  aria-hidden
                >
                  &rarr;
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        id={panelId}
        role={showTabs ? "tabpanel" : undefined}
        aria-labelledby={
          showTabs ? `${reactId}-tab-${active.id}` : undefined
        }
        className="col-start-2 col-end-5 min-w-0 md:col-end-9"
      >
        {active.products.length === 0 ? (
          <p className="font-archivo-light px-(--grid-gutter) text-[18px]">—</p>
        ) : (
          <div
            ref={viewportRef}
            className="overflow-hidden border-t border-r border-sky"
            style={{ touchAction: "pan-y" }}
          >
            <ul
              ref={trackRef}
              className="product-list flex w-max will-change-transform"
            >
              {active.products.map((product) => (
                <li
                  key={product.id}
                  className="product-card w-[calc(var(--product-carousel-width)/2)] shrink-0 border-b border-l border-sky transition-colors duration-500 md:w-[calc(var(--product-carousel-width)/3)]"
                >
                  <ProductCard
                    product={product}
                    soldOutLabel={soldOutLabel}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    onClick={(event) => {
                      if (timeSinceDrag() < 0.15) event.preventDefault();
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GridSection>
  );
}
