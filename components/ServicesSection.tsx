"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { Flip, gsap } from "@/lib/gsapConfig";
import { REVEAL_BLOCK } from "@/lib/colors";
import { GRID_CONTENT_IMAGE_SIZES } from "@/lib/grid";
import { routes } from "@/lib/routes";

/**
 * The rows run on the page's 7 columns — the same ones the hero and the
 * calendar sit on — so the feature image always lands on real grid lines.
 */
const COLUMNS = 7;

/** Type occupies the first three columns; the image gets the bare four. */
const TYPE_COLUMNS = 3;
const TYPE_WIDTH = `calc(${TYPE_COLUMNS * 100}% / ${COLUMNS})`;

/**
 * The bare half of each row is split into two bands, making the cells out
 * there roughly square. Every frame currently claims both bands — a service
 * can take just one, which is why placement carries a rowStart/rowSpan.
 */
const FRAME_ROWS = 2;

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

const services = [
  {
    index: "01",
    title: "Delivery",
    href: routes.shop,
    cta: "Order delivery",
    body: "Plates, salads and juices prepared each morning and delivered ready to serve — to a desk, a boardroom or a kitchen table.",
    src: "/images/william-king.jpg",
    /** 1-based placement in the row's 7 columns x FRAME_ROWS bands. */
    frame: { colStart: 5, colSpan: 3, rowStart: 1, rowSpan: 2 },
  },
  {
    index: "02",
    title: "Events",
    href: routes.events,
    cta: "Plan an event",
    body: "From a twenty-person launch to a seated dinner. We handle the menu, the service and everything that has to happen before the doors open.",
    src: "/images/nicole-herrero.jpg",
    frame: { colStart: 4, colSpan: 2, rowStart: 1, rowSpan: 2 },
  },
  {
    index: "03",
    title: "Coffee",
    href: routes.coffee,
    cta: "Find the coffee desk",
    body: "A coffee desk for anyone passing by, and the same pastries and juices we send out to our clients.",
    // Placeholder until the coffee desk is shot — swap for a /public image.
    src: "https://picsum.photos/seed/moment-coffee/1200/1600",
    frame: { colStart: 6, colSpan: 2, rowStart: 1, rowSpan: 2 },
  },
] as const;

const isDesktop = () => window.matchMedia("(width >= 48rem)").matches;

export function ServicesSection() {
  const rowsRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);
  /** The first placement is a jump; every later one is a Flip. */
  const placedRef = useRef(false);
  const [active, setActive] = useState(0);

  /** Snap the feature frame onto the active row's cells, without animating. */
  const placeFrame = useCallback(() => {
    const container = rowsRef.current;
    const frame = frameRef.current;
    const row = rowRefs.current[activeRef.current];
    if (!container || !frame || !row) return;

    const { colStart, colSpan, rowStart, rowSpan } =
      services[activeRef.current].frame;
    const width = container.clientWidth;

    // +1 / -1 keeps the row's 1px top rule visible above the image, rather
    // than the photo edge painting over it.
    const rowTop = row.offsetTop + 1;
    const rowHeight = row.offsetHeight - 1;

    gsap.set(frame, {
      left: ((colStart - 1) / COLUMNS) * width,
      width: (colSpan / COLUMNS) * width,
      top: rowTop + ((rowStart - 1) / FRAME_ROWS) * rowHeight,
      height: (rowSpan / FRAME_ROWS) * rowHeight,
    });
  }, []);

  useGSAP(
    () => {
      if (!frameRef.current) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      activeRef.current = active;

      // Below md the frame is display:none and Flip would read a zero rect,
      // so the mobile path only ever snaps.
      if (placedRef.current && isDesktop()) {
        // Flip reads the frame where it is, we move it, Flip tweens the gap —
        // so one element travels between grid slots and resizes on the way.
        const state = Flip.getState(frameRef.current);
        placeFrame();
        Flip.from(state, {
          duration: reduceMotion ? 0 : 0.7,
          ease: "power3.inOut",
        });
      } else {
        placeFrame();
        placedRef.current = true;
      }

      const images = imageRefs.current.filter(Boolean) as HTMLDivElement[];

      gsap.to(images, {
        opacity: (index: number) => (index === active ? 1 : 0),
        duration: reduceMotion ? 0 : 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (!reduceMotion && images[active]) {
        gsap.fromTo(
          images[active],
          { scale: 1.06 },
          { scale: 1, duration: 1.1, ease: "power3.out", overwrite: "auto" },
        );
      }
    },
    { dependencies: [active, placeFrame] },
  );

  // Row heights are svh-based, so a resize moves every slot the frame knows
  // about — including the resize that crosses the md breakpoint.
  useEffect(() => {
    placeFrame();
    const onResize = () => placeFrame();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [placeFrame]);

  return (
    <section
      className="relative w-full bg-cream pt-[12svh] pb-[14svh]"
      style={{ "--type-width": TYPE_WIDTH } as CSSProperties}
    >
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="col-start-2">
          <div className="px-(--grid-gutter) pb-[5svh]">
            <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
              What we do
            </h2>
          </div>

          <div ref={rowsRef} className="relative border-b border-sky">
            {services.map((service, index) => (
              <div
                key={service.index}
                ref={(element) => {
                  rowRefs.current[index] = element;
                }}
                className="relative border-t border-sky"
              >
                {/* Interior column lines, a shade lighter than the spines.
                    They start at the edge of the type block so no rule ever
                    runs through the headline — the same holes the hero cuts. */}
                <div
                  className="pointer-events-none absolute inset-0 hidden md:block"
                  aria-hidden
                >
                  {Array.from(
                    { length: COLUMNS - TYPE_COLUMNS },
                    (_, n) => n + TYPE_COLUMNS,
                  ).map((boundary) => (
                    <span
                      key={`column-${boundary}`}
                      className="absolute inset-y-0 w-px bg-sky/45"
                      style={{ left: `${(boundary / COLUMNS) * 100}%` }}
                    />
                  ))}

                  {/* The band rules the frame lands on, drawn only across the
                      image zone so they never reach the headline. */}
                  {Array.from({ length: FRAME_ROWS - 1 }, (_, n) => n + 1).map(
                    (band) => (
                      <span
                        key={`band-${band}`}
                        className="absolute right-0 h-px bg-sky/45"
                        style={{
                          left: `${(TYPE_COLUMNS / COLUMNS) * 100}%`,
                          top: `${(band / FRAME_ROWS) * 100}%`,
                        }}
                      />
                    ),
                  )}
                </div>

                <Link
                  href={service.href}
                  className="group relative block"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  {/* text-left: TextReveal centres each split line unless an
                      ancestor opts out. */}
                  <div className="flex flex-col gap-6 px-(--grid-gutter) py-[5svh] text-left md:h-[42svh] md:w-(--type-width) md:justify-between md:gap-0 md:py-[4svh]">
                    <span className="font-archivo-light text-[12px] tabular-nums">
                      {service.index}
                    </span>

                    <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
                      <h3 className="font-owners-narrow-bold text-[13vw] leading-[0.9] wrap-break-word uppercase md:text-[min(5.6vw,9svh)]">
                        {service.title}
                      </h3>
                    </TextReveal>

                    {/* Desktop gets one travelling image; the phone gets the
                        picture inline, where there is no hover to drive it. */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-sky/20 md:hidden">
                      <Image
                        src={service.src}
                        alt=""
                        fill
                        sizes={GRID_CONTENT_IMAGE_SIZES}
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
                        <p className="font-archivo-light max-w-[36ch] text-[18px] leading-normal">
                          {service.body}
                        </p>
                      </TextReveal>

                      <div className="mt-5 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 group-hover:bg-cream">
                        <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                          {service.cta}
                          <span
                            className="transition-transform duration-500 group-hover:translate-x-1.5"
                            aria-hidden
                          >
                            &rarr;
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            <div
              ref={frameRef}
              className="pointer-events-none absolute top-0 left-0 hidden overflow-hidden bg-sky/20 will-change-transform md:block"
              aria-hidden
            >
              {services.map((service, index) => (
                <div
                  key={service.index}
                  ref={(element) => {
                    imageRefs.current[index] = element;
                  }}
                  className="absolute inset-0 will-change-transform"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <Image
                    src={service.src}
                    alt=""
                    fill
                    sizes="45vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
