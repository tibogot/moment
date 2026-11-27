"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { CellGrid } from "@/components/v2/CellGrid";
import { GridSpacer } from "@/components/v2/GridSpacer";
import { gsap } from "@/lib/gsap";
import { loadDraggable, type DraggableInstance } from "@/lib/gsap/draggable";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  id: string;
  /** Already in the page's language (resolved on the server). */
  quote: string;
  name: string;
  company: string | null;
};

type TestimonialCellsProps = {
  items: TestimonialItem[];
  label: string;
  prevLabel: string;
  nextLabel: string;
};

/** Copies of the list in the track: the real one in the middle. */
const COPIES = 3;

/**
 * Customer reviews on the 16 / 12 / 4 grid, as an endless carousel — a first
 * version, to be redesigned (26 November 2026). Written from the Studio
 * ("Avis clients").
 *
 * The feel of the home's product carousel (ProductCarouselCells) — drag and
 * swipe with inertia, arrows from a tablet up, every throw ending on a whole
 * card so its edges fall on grid lines — except that it never ends: past the
 * last review comes the first again, both ways. Nothing moves on its own.
 *
 * How: the list is rendered three times; Draggable moves an invisible proxy,
 * and the track follows the proxy's x wrapped into the middle copy's range,
 * so the strip always has cards on both sides. The two outer copies are
 * hidden from assistive tech — a screen reader reads each review once.
 *
 * When the reviews do not fill the strip (three cards on a desktop where four
 * fit), there is nothing to loop: one copy, no drag, no arrows — otherwise the
 * same review would sit next to itself.
 *
 *   row 1     the label and the arrows
 *   rows 2–5  the cards: 4 cells wide and 4 rows tall at every width, the
 *             same columns as the offer cards under them (OfferCards), and
 *             3/4 — never a square (27 November 2026: at 4 cells over 3 rows
 *             the desktop cards were exactly square). Four in view on a
 *             desktop, three on a tablet, one on a phone — where the arrows
 *             show too, since no cut card hints at the next one.
 *
 * Followed by one empty row of the grid, so the reviews do not run into the
 * section under them.
 *
 * Renders nothing without a review. The cards move, so they draw their own
 * rule on the right edge; the strip is a `data-grid-hole`.
 */
export function TestimonialCells({
  items,
  label,
  prevLabel,
  nextLabel,
}: TestimonialCellsProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const proxyRef = useRef<HTMLDivElement>(null);
  // Decided after measuring: do the reviews overflow the strip?
  const [loops, setLoops] = useState(false);
  const stepRef = useRef<(direction: -1 | 1) => void>(() => {});

  useGSAP(
    () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const proxy = proxyRef.current;
      if (!track || !viewport || !proxy || items.length === 0) return;

      let cancelled = false;
      let draggable: DraggableInstance | null = null;

      const cardWidth = () =>
        track.querySelector<HTMLElement>("li")?.offsetWidth ?? 1;
      /** Width of one copy of the list. */
      const setWidth = () => cardWidth() * items.length;
      const overflows = () => setWidth() > viewport.clientWidth + 1;

      // The track sits on the middle copy: x in [-2W, -W).
      const place = () => {
        const w = setWidth();
        const x = Number(gsap.getProperty(proxy, "x") ?? 0);
        gsap.set(track, { x: gsap.utils.wrap(-2 * w, -w, x - w) });
      };

      const setup = () => {
        const shouldLoop = overflows();
        setLoops(shouldLoop);
        if (!shouldLoop) {
          draggable?.disable();
          gsap.set(track, { x: 0 });
          return;
        }
        draggable?.enable();
        // Back onto a whole card after a resize.
        const x = Number(gsap.getProperty(proxy, "x") ?? 0);
        gsap.set(proxy, { x: Math.round(x / cardWidth()) * cardWidth() });
        place();
      };

      stepRef.current = (direction) => {
        const x = Number(gsap.getProperty(proxy, "x") ?? 0);
        const target = Math.round(x / cardWidth()) * cardWidth();
        gsap.to(proxy, {
          x: target - direction * cardWidth(),
          duration: 0.6,
          ease: "power2.out",
          onUpdate: place,
        });
      };

      gsap.set(proxy, { x: 0 });

      loadDraggable().then((Draggable) => {
        if (cancelled) return;
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        draggable = Draggable.create(proxy, {
          type: "x",
          trigger: viewport,
          inertia: !reduceMotion,
          allowNativeTouchScrolling: true,
          cursor: "grab",
          activeCursor: "grabbing",
          // No bounds: it loops. Every throw still ends on a whole card.
          snap: {
            x: (value: number) => Math.round(value / cardWidth()) * cardWidth(),
          },
          onDrag: place,
          onThrowUpdate: place,
          onPress: () => viewport.setAttribute("data-dragging", ""),
          onRelease: () => viewport.removeAttribute("data-dragging"),
        })[0];
        setup();
      });

      const observer = new ResizeObserver(setup);
      observer.observe(viewport);
      return () => {
        cancelled = true;
        observer.disconnect();
        draggable?.kill();
        gsap.set(track, { clearProps: "transform" });
      };
    },
    { scope: viewportRef, dependencies: [items.length] },
  );

  if (items.length === 0) return null;

  const LABEL = "font-owners-medium text-[12px] uppercase tracking-wide";
  const BUTTON =
    "font-owners-medium px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 hover:bg-sky/30";

  // Three copies when it loops, so there are always cards on both sides.
  const copies = loops ? COPIES : 1;

  return (
    <>
      <section
        aria-labelledby="testimonials-title"
        className="relative z-1 -mb-(--grid-line) w-full border-b border-sky bg-cream"
      >
        <CellGrid
          lineClassName="bg-sky"
          bands={false}
          readout={false}
          subdivide={2}
          linesOnTop
        />
        <div
          className="relative grid [--rows:5]"
          style={{
            gridTemplateColumns: "var(--s-grid-columns)",
            gridTemplateRows: "repeat(var(--rows), var(--s-cell-h))",
          }}
        >
          {/* Row 1: the label and the arrows. */}
          <div
            data-grid-hole
            className="col-[2/span_4] row-[1] flex min-w-0 items-end justify-between gap-3 p-(--v2-pad) md:col-[2/span_12] lg:col-[2/span_16]"
          >
            <h2 id="testimonials-title" className={LABEL}>
              {label}
            </h2>
            {loops && (
              <div className="flex border border-sky bg-cream">
                <button
                  type="button"
                  onClick={() => stepRef.current(-1)}
                  aria-label={prevLabel}
                  className={cn(BUTTON, "border-r border-sky")}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => stepRef.current(1)}
                  aria-label={nextLabel}
                  className={BUTTON}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* The strip the cards run in: rows 2 to the end, the full width. */}
          <div
            ref={viewportRef}
            data-grid-hole
            className={cn(
              "relative col-[2/span_4] row-[2/-1] min-w-0 overflow-hidden md:col-[2/span_12] lg:col-[2/span_16]",
              loops && "drag-carousel",
            )}
            style={{ touchAction: "pan-y" }}
          >
            {/* What Draggable actually moves; the track follows it, wrapped. */}
            <div ref={proxyRef} aria-hidden className="absolute size-0" />
            <ul
              ref={trackRef}
              className="flex h-full w-max will-change-transform"
            >
              {Array.from({ length: copies }, (_, copy) =>
                items.map((item) => {
                  // The middle copy is the real list; the others are filler.
                  const isReal = copies === 1 || copy === 1;
                  return (
                    <li
                      key={`${copy}-${item.id}`}
                      aria-hidden={isReal ? undefined : true}
                      className="relative h-full w-[calc(var(--s-cell-w)*4)] shrink-0 select-none"
                    >
                      <figure className="flex h-full flex-col justify-between p-(--v2-pad)">
                        <blockquote className="font-archivo-light line-clamp-7 text-(length:--body-text) leading-normal text-pretty">
                          « {item.quote} »
                        </blockquote>
                        <figcaption>
                          <span className="font-owners-medium block text-[12px] tracking-wide uppercase">
                            {item.name}
                          </span>
                          {/* Always there, a blank space when there is no
                            company: the names then sit on one line across
                            the cards. */}
                          <span className="font-archivo-light mt-1 block text-[13px] opacity-70">
                            {item.company || " "}
                          </span>
                        </figcaption>
                      </figure>
                      {/* The card's own rule on its right edge, centred on
                        the line like the grid's. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 right-0 w-(--grid-line) translate-x-1/2 bg-sky"
                      />
                    </li>
                  );
                }),
              )}
            </ul>
          </div>
        </div>
      </section>
      <GridSpacer />
    </>
  );
}
