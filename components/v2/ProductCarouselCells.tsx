"use client";

import { useGSAP } from "@gsap/react";
import { useId, useRef, useState } from "react";
import { CdnImage as Image } from "@/components/CdnImage";
import { LocaleLink as Link } from "@/components/LocaleLink";
import type { ProductCarouselTab } from "@/components/ProductTabsCarousel";
import { CellGrid } from "@/components/v2/CellGrid";
import { DietBadges } from "@/components/DietBadges";
import { useDictionary } from "@/components/LocaleProvider";
import { gsap } from "@/lib/gsap";
import {
  loadDraggable,
  timeSinceDrag,
  type DraggableInstance,
} from "@/lib/gsap/draggable";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ProductCarouselCellsProps = {
  tabs: ProductCarouselTab[];
  /**
   * One link to the whole shop. Not a "see all" per tab: each tab already
   * shows its whole category, and "see all" read as "every product".
   */
  shopLink: { href: string; label: string };
  soldOutLabel: string;
  prevLabel: string;
  nextLabel: string;
  defaultTabId?: string;
  /**
   * The carousel continues the section above (the home's intro): no rule
   * along its top, so the intro's space runs into the tabs and the first
   * rule is the one over the cards.
   */
  joined?: boolean;
  /**
   * A large title on a row of its own above the tabs, in the type of the
   * offer cards' "Pour chaque moment" (the home's second carousel, "Nos
   * collections", 27 November 2026). It is then the section's h2.
   */
  title?: string;
};

/**
 * The home's occasion carousel on the 16 / 12 / 4 grid (25 November 2026):
 * the behaviour of ProductTabsCarousel — tabs, drag with inertia, arrows —
 * with the cards of "Nos collections" (CollectionsSection): the title large
 * on top, a rule, the image under it, rules between the cards, the sky
 * fill on hover.
 *
 * Sized in cells. The tabs, arrows and "see all" take the first row; the
 * cards the rows under it. A card is 4 cells wide on desktop (four in
 * view) and on a tablet (three), 3 on a phone (one and a third: the cut
 * card says there is more to swipe); its title takes one row, its image
 * the next three (two on a phone). The track snaps to whole cards, so at
 * rest every card edge falls on a grid line.
 *
 * The cursor: the pointing finger over the cards (they are links), the
 * closed hand only while the strip is held and dragged.
 *
 * The cards move, so they draw their own rules rather than the grid's: the
 * strip they run in is a `data-grid-hole`, and each card carries a rule on
 * its right edge and one under its title, centred on the line like the
 * grid's own.
 */
export function ProductCarouselCells({
  tabs,
  shopLink,
  soldOutLabel,
  prevLabel,
  nextLabel,
  defaultTabId,
  joined = false,
  title,
}: ProductCarouselCellsProps) {
  const reactId = useId();
  const dictionary = useDictionary();
  const dietLabels = dictionary.shop.filters.tags;
  const panelId = `${reactId}-carousel`;
  const [activeId, setActiveId] = useState(
    () => defaultTabId ?? tabs[0]?.id ?? "",
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const productCount = active?.products.length ?? 0;
  const showTabs = tabs.length > 1;

  const bounds = () => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return { minX: 0, maxX: 0 };
    const overflow = track.scrollWidth - viewport.clientWidth;
    return { minX: overflow > 0 ? -overflow : 0, maxX: 0 };
  };
  const cardWidth = () =>
    trackRef.current?.querySelector<HTMLElement>("li")?.offsetWidth ?? 1;

  const syncScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    const { minX } = bounds();
    const x = Number(gsap.getProperty(track, "x") ?? 0);
    setCanScrollPrev(x < -4);
    setCanScrollNext(x > minX + 4);
  };

  useGSAP(
    () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport || productCount === 0) return;

      let cancelled = false;
      let draggable: DraggableInstance | null = null;

      const syncBounds = () => {
        const b = bounds();
        draggable?.applyBounds(b);
        // Back onto a whole card after a resize.
        const x = Number(gsap.getProperty(track, "x") ?? 0);
        const snapped = Math.round(x / cardWidth()) * cardWidth();
        gsap.set(track, { x: gsap.utils.clamp(b.minX, b.maxX, snapped) });
        syncScrollState();
      };

      gsap.set(track, { x: 0 });
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
          // The finger over the cards; the closed hand while held (globals.css).
          cursor: "pointer",
          activeCursor: "grabbing",
          bounds: bounds(),
          // Every throw ends on a whole card, its edges on the grid.
          snap: {
            x: (value: number) => Math.round(value / cardWidth()) * cardWidth(),
          },
          onDrag: syncScrollState,
          onThrowUpdate: syncScrollState,
          onThrowComplete: syncScrollState,
          onDragEnd: syncScrollState,
          // The closed hand over the whole strip while dragging: the links
          // inside would otherwise show their own cursor.
          onPress: () => viewport.setAttribute("data-dragging", ""),
          onRelease: () => viewport.removeAttribute("data-dragging"),
        })[0];
        syncBounds();
      });

      const observer = new ResizeObserver(syncBounds);
      observer.observe(track);
      observer.observe(viewport);
      return () => {
        cancelled = true;
        observer.disconnect();
        draggable?.kill();
        gsap.set(track, { clearProps: "transform" });
      };
    },
    { scope: viewportRef, dependencies: [active?.id, productCount] },
  );

  if (tabs.length === 0 || !active) return null;

  const step = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const { minX } = bounds();
    const x = Number(gsap.getProperty(track, "x") ?? 0);
    gsap.to(track, {
      x: gsap.utils.clamp(minX, 0, x - direction * cardWidth()),
      duration: 0.6,
      ease: "power2.out",
      onUpdate: syncScrollState,
      onComplete: syncScrollState,
    });
  };

  const LABEL = "font-owners-medium text-[12px] uppercase tracking-wide";
  const BUTTON =
    "font-owners-medium px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 enabled:hover:bg-sky/30 disabled:opacity-30";

  return (
    // The bottom border closes the last row of cards. Pulled up by a rule and
    // raised a layer: a section after it that opens on a rule draws that rule
    // on the same pixels (no double line); one that opens on a band (the
    // footer) leaves it showing. The section after may
    // open on a band (the footer), not a rule.
    <section className="relative z-1 -mb-(--grid-line) w-full border-b border-sky bg-cream">
      {/* Rules over the content: the edge-to-edge images would cover the
          frame's spines at either end of the strip. */}
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        readout={false}
        subdivide={2}
        linesOnTop
        topRule={!joined}
      />
      <div
        className={cn(
          "relative grid",
          title ? "[--rows:5] md:[--rows:6]" : "[--rows:4] md:[--rows:5]",
        )}
        style={{
          gridTemplateColumns: "var(--s-grid-columns)",
          gridTemplateRows: "repeat(var(--rows), var(--s-cell-h))",
        }}
      >
        {title && (
          <div
            data-grid-hole
            className="col-[2/span_4] row-[1] flex min-w-0 items-end p-(--v2-pad) md:col-[2/span_12] lg:col-[2/span_16]"
          >
            <h2 className="font-owners-narrow-bold text-[9vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[length:calc(var(--s-cell-w)*0.55)]">
              {title}
            </h2>
          </div>
        )}
        {/* The tabs, the arrows and "see all": row 1, or 2 under a title. */}
        <div
          data-grid-hole
          className={cn(
            title ? "row-[2]" : "row-[1]",
            "col-[2/span_4] flex min-w-0 flex-col justify-end gap-3 p-(--v2-pad) md:col-[2/span_12] md:flex-row md:items-end md:justify-between lg:col-[2/span_16]",
          )}
        >
          {/* With tabs there is no visible heading, and the cards are h3s:
              a hidden h2 keeps the page outline h1 → h2 → h3. */}
          {showTabs && !title && (
            <h2 className="sr-only">{dictionary.home.moments.heading}</h2>
          )}
          {showTabs ? (
            <ul
              // One line that scrolls sideways on a phone: with the owners' four
              // collections after the moments (27 November 2026) the wrapped
              // tabs ran out of their cell.
              className="-mx-(--v2-pad) flex gap-x-5 gap-y-2 overflow-x-auto px-(--v2-pad) whitespace-nowrap [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
              role="tablist"
              aria-label={tabs.map((tab) => tab.label).join(", ")}
            >
              {tabs.map((tab) => (
                <li
                  key={tab.id}
                  role="presentation"
                  className={cn(
                    // The owners' two groups: the moments, then the
                    // collections (27 November 2026).
                    tab.startsGroup &&
                      "before:mr-5 before:inline-block before:h-[0.9em] before:w-(--grid-line) before:translate-y-[0.1em] before:bg-black/30 before:content-['']",
                  )}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab.id === active.id}
                    aria-controls={panelId}
                    id={`${reactId}-tab-${tab.id}`}
                    onClick={() => setActiveId(tab.id)}
                    className={cn(
                      "animated-underline cursor-pointer",
                      LABEL,
                      tab.id !== active.id && "opacity-50",
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <h2 className={LABEL}>{active.label}</h2>
          )}

          <div className="flex items-center gap-5">
            {/* The arrows only when there is something to scroll, and not on
                a phone, where the cut card already says "swipe". */}
            {(canScrollPrev || canScrollNext) && (
              <div className="hidden border border-sky bg-cream md:flex">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  disabled={!canScrollPrev}
                  aria-label={prevLabel}
                  className={cn(BUTTON, "border-r border-sky")}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  disabled={!canScrollNext}
                  aria-label={nextLabel}
                  className={BUTTON}
                >
                  →
                </button>
              </div>
            )}
            {/* The whole shop, as a text link in the tabs' type: the next
                step after the carousel, without competing with the tabs. */}
            <Link
              href={shopLink.href}
              className={cn("group inline-flex items-center gap-2", LABEL)}
            >
              <span className="animated-underline">{shopLink.label}</span>
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* The strip the cards run in: rows 2 to the end, the full width. */}
        <div
          ref={viewportRef}
          id={panelId}
          role={showTabs ? "tabpanel" : undefined}
          aria-labelledby={showTabs ? `${reactId}-tab-${active.id}` : undefined}
          data-grid-hole
          className={cn(
            title ? "row-[3/-1]" : "row-[2/-1]",
            "relative col-[2/span_4] min-w-0 overflow-hidden md:col-[2/span_12] lg:col-[2/span_16] drag-carousel",
          )}
          style={{ touchAction: "pan-y" }}
        >
          <ul
            ref={trackRef}
            className="flex h-full w-max will-change-transform"
          >
            {active.products.map((product) => (
              <li
                key={product.id}
                className="collection-card group relative h-full w-[calc(var(--s-cell-w)*3)] shrink-0 transition-colors duration-500 md:w-[calc(var(--s-cell-w)*4)]"
              >
                <Link
                  href={routes.product(product.handle)}
                  onClick={(event) => {
                    if (timeSinceDrag() < 0.15) event.preventDefault();
                  }}
                  className="flex h-full flex-col"
                >
                  {/* Title row: one cell high. */}
                  <div className="flex h-(--s-cell-h) shrink-0 flex-col justify-between p-(--v2-pad)">
                    <div className="min-w-0">
                      <h3 className="font-owners-narrow-bold line-clamp-2 text-[length:max(18px,calc(var(--s-cell-h)*0.2))] leading-[0.95] uppercase">
                        {product.title}
                      </h3>
                      {/* A few words under the title: the product's
                          "Accroche" (custom.short_description), else the
                          start of its description, on one line. */}
                      <p className="font-archivo-light mt-1.5 truncate text-[15px] leading-tight">
                        {product.shortDescription || product.description}
                      </p>
                    </div>
                    <span className="font-archivo-light text-[14px]">
                      {product.displayPrice}
                    </span>
                  </div>
                  {/* The image: the rows under the title, inset by the cell's
                      padding. (Edge to edge was tried on 25 November 2026.) */}
                  <div className="min-h-0 flex-1 p-(--v2-pad)">
                    <div className="collection-card__image relative h-full w-full overflow-hidden">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.imageAlt}
                          fill
                          sizes="(max-width: 768px) 75vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                      {!product.availableForSale && (
                        <span className="font-owners-medium absolute top-3 left-3 bg-cream px-2 py-1 text-[10px] uppercase">
                          {soldOutLabel}
                        </span>
                      )}
                      <DietBadges
                        tags={product.tags ?? []}
                        labels={dietLabels}
                        className="absolute bottom-3 left-3"
                      />
                    </div>
                  </div>
                </Link>
                {/* The card's rules, centred on the lines like the grid's:
                    under the title, and on its right edge. */}
                <span
                  aria-hidden
                  className="collection-card__rule pointer-events-none absolute inset-x-0 h-(--grid-line) -translate-y-1/2"
                  style={{ top: "var(--s-cell-h)" }}
                />
                <span
                  aria-hidden
                  className="collection-card__rule pointer-events-none absolute inset-y-0 right-0 w-(--grid-line) translate-x-1/2"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
