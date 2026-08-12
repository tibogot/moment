"use client";

import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridLines } from "@/components/GridLines";
import { gsap } from "@/lib/gsapConfig";
import { routes } from "@/lib/routes";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Experimental duplicate of PanelPairSection: the photograph is sliced into the
 * same 3 × 3 cell geometry, except the bottom-left title block is one double-
 * wide tile. Hover flips every tile to a sky back; leave flips them back.
 *
 * Flip is a hinge (rotateY → 90°, swap faces, rotateY → 0). Cells stay
 * overflow-visible so perspective does not clip the top and bottom edges.
 */

const PANEL_COLUMNS = 3;
const PANEL_ROWS = 3;
const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

/**
 * Same visual grid as PanelPairSection, but the cleared title block is a
 * single col-span-2 tile so it flips as one piece.
 */
const TILES = [
  { key: "0-0", col: 0, row: 0, colSpan: 1 },
  { key: "1-0", col: 1, row: 0, colSpan: 1 },
  { key: "2-0", col: 2, row: 0, colSpan: 1 },
  { key: "0-1", col: 0, row: 1, colSpan: 1 },
  { key: "1-1", col: 1, row: 1, colSpan: 1 },
  { key: "2-1", col: 2, row: 1, colSpan: 1 },
  { key: "title", col: 0, row: 2, colSpan: 2, hasTitle: true },
  { key: "2-2", col: 2, row: 2, colSpan: 1 },
] as const;

/**
 * Fixed start order for the stagger — same every hover, just not left-to-right
 * then top-to-bottom, which reads as a linear wipe.
 */
const FLIP_ORDER = [3, 7, 0, 5, 1, 6, 2, 4] as const;

const panels = [
  { key: "events", href: routes.events, src: "/images/onur-kaya.jpg" },
  { key: "coffee", href: routes.coffee, src: "/images/oak-bond-coffee.jpg" },
] as const;

type PanelKey = (typeof panels)[number]["key"];

type PanelPairFlipSectionProps = {
  copy: Record<PanelKey, string>;
  images?: Partial<Record<PanelKey, SanityImage | null>>;
  className?: string;
};

const titleClassName =
  "font-owners-narrow-bold text-[9.4vw] leading-[0.9] uppercase md:text-[min(4.4vw,7.6svh)]";

function FlipPanel({
  href,
  src,
  label,
}: {
  href: string;
  src: string;
  label: string;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const flippedRef = useRef(false);
  const enabledRef = useRef(false);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const tiles = Array.from(
      board.querySelectorAll<HTMLElement>("[data-flip-tile]"),
    );
    gsap.set(tiles, {
      rotateY: 0,
      transformOrigin: "50% 50%",
      transformPerspective: 1600,
      force3D: true,
    });
    gsap.set(board.querySelectorAll('[data-face="back"]'), { autoAlpha: 0 });
    gsap.set(board.querySelectorAll('[data-face="front"]'), { autoAlpha: 1 });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia("(hover: hover)").matches;
    enabledRef.current = !reduceMotion && supportsHover;

    return () => {
      timelinesRef.current.forEach((tl) => tl.kill());
      gsap.killTweensOf(tiles);
    };
  }, []);

  const flipTo = (flipped: boolean) => {
    if (!enabledRef.current || !boardRef.current) return;
    if (flippedRef.current === flipped) return;

    flippedRef.current = flipped;

    const tiles = Array.from(
      boardRef.current.querySelectorAll<HTMLElement>("[data-flip-tile]"),
    );

    timelinesRef.current.forEach((tl) => tl.kill());
    timelinesRef.current = [];

    tiles.forEach((tile, index) => {
      const front = tile.querySelector<HTMLElement>('[data-face="front"]');
      const back = tile.querySelector<HTMLElement>('[data-face="back"]');
      if (!front || !back) return;

      const show = flipped ? back : front;
      const hide = flipped ? front : back;

      const tl = gsap.timeline({ delay: FLIP_ORDER[index] * 0.055 });
      timelinesRef.current.push(tl);

      // Edge-on → swap the flat faces → open the other way.
      tl.to(tile, {
        rotateY: 90,
        duration: 0.5,
        ease: "sine.in",
      })
        .set(hide, { autoAlpha: 0 })
        .set(show, { autoAlpha: 1 })
        .set(tile, { rotateY: -90 })
        .to(tile, {
          rotateY: 0,
          duration: 0.55,
          ease: "sine.out",
        });
    });
  };

  return (
    <Link
      href={href}
      aria-label={label}
      onMouseEnter={() => flipTo(true)}
      onMouseLeave={() => flipTo(false)}
      className="group relative block aspect-3/4 md:aspect-6/7"
    >
      <div
        ref={boardRef}
        className="absolute inset-0 grid grid-cols-3 grid-rows-3"
        aria-hidden
      >
        {TILES.map((tile) => {
          const lastRow = tile.row === PANEL_ROWS - 1;
          const cellBorder = cn(
            "border-t border-cream/60",
            lastRow && "border-b",
            tile.col > 0 && "border-l",
          );

          // Mosaic sized to this tile: a col-span-2 cell is twice as wide, so
          // the full board image is 1.5× that width rather than 3×.
          const mosaicWidth = `${(PANEL_COLUMNS / tile.colSpan) * 100}%`;
          const mosaicHeight = `${PANEL_ROWS * 100}%`;
          const mosaicLeft = `-${(tile.col / tile.colSpan) * 100}%`;
          const mosaicTop = `-${tile.row * 100}%`;

          return (
            <div
              key={tile.key}
              className="relative"
              style={{
                gridColumn: `${tile.col + 1} / span ${tile.colSpan}`,
                gridRow: tile.row + 1,
              }}
            >
              <div
                data-flip-tile
                className="absolute inset-0"
                style={{ transformOrigin: "50% 50%" }}
              >
                {/* Front — photograph (+ cream title on the wide title tile). */}
                <div
                  data-face="front"
                  className={cn(
                    "absolute inset-0 overflow-hidden bg-sky",
                    cellBorder,
                  )}
                >
                  <div
                    className="absolute"
                    style={{
                      width: mosaicWidth,
                      height: mosaicHeight,
                      left: mosaicLeft,
                      top: mosaicTop,
                    }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 48rem) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  {"hasTitle" in tile && tile.hasTitle ? (
                    <div className="absolute inset-0 flex items-end pb-(--grid-gutter) pl-(--grid-gutter)">
                      <span className={cn(titleClassName, "text-cream")}>
                        {label}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Back — sky cover (+ black title on the wide title tile). */}
                <div
                  data-face="back"
                  className={cn(
                    "absolute inset-0 overflow-hidden bg-sky",
                    cellBorder,
                  )}
                >
                  {"hasTitle" in tile && tile.hasTitle ? (
                    <div className="absolute inset-0 flex items-end pb-(--grid-gutter) pl-(--grid-gutter)">
                      <span className={cn(titleClassName, "text-black")}>
                        {label}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}

export function PanelPairFlipSection({
  copy,
  images,
  className,
}: PanelPairFlipSectionProps) {
  const sourceFor = (key: PanelKey, fallback: string) => {
    const image = images?.[key];
    return image ? urlFor(image).width(1600).auto("format").url() : fallback;
  };

  return (
    <section className={cn("relative w-full bg-cream pb-[12svh]", className)}>
      <GridLines lineClassName="bg-sky" />

      <div className="relative">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: MARGIN_COLUMNS }}
        >
          <div className="col-start-2 grid grid-cols-1 gap-(--grid-gutter) px-(--grid-gutter) md:grid-cols-2">
            {panels.map((panel) => (
              <FlipPanel
                key={panel.key}
                href={panel.href}
                src={sourceFor(panel.key, panel.src)}
                label={copy[panel.key]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
