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
 * Comparison build of the tiled flip, sitting under PanelPairFlipSection.
 *
 * The hinge above kills eight timelines on every hover and swaps faces at 90°.
 * This one keeps a single paused timeline per card and reverses it, uses a
 * real 0→180 card (both faces live, backface hidden), and puts perspective on
 * the board so the mosaic shares one camera.
 *
 * Grid rules are gutters, not borders on the faces — cream shows through
 * `--grid-line` gaps so the lines stay still while the tiles turn.
 */

const PANEL_COLUMNS = 3;
const PANEL_ROWS = 3;
const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";
const LINE = "var(--grid-line)";

/**
 * Photograph sized to the full board, then clipped by the tile. Percentages
 * are relative to the tile, so the extra line terms restore the gutters
 * (`gap` + top/bottom padding) that a plain 300% mosaic would skip.
 */
function mosaicBox(col: number, row: number, colSpan: number) {
  const widthExtra = colSpan === 1 ? `2 * ${LINE}` : `${LINE} / 2`;

  return {
    width: `calc(${(PANEL_COLUMNS / colSpan) * 100}% + ${widthExtra})`,
    height: `calc(${PANEL_ROWS * 100}% + 4 * ${LINE})`,
    left: `calc(${(-col / colSpan) * 100}% - ${col} * ${LINE})`,
    top: `calc(${-row * 100}% - ${row + 1} * ${LINE})`,
  };
}

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

const FLIP_ORDER = [3, 7, 0, 5, 1, 6, 2, 4] as const;

const panels = [
  { key: "events", href: routes.events, src: "/images/onur-kaya.jpg" },
  { key: "coffee", href: routes.coffee, src: "/images/oak-bond-coffee.jpg" },
] as const;

type PanelKey = (typeof panels)[number]["key"];

type PanelCopy = {
  title: string;
  lead: string;
};

type PanelPairFlipSmoothSectionProps = {
  copy: Record<PanelKey, PanelCopy>;
  images?: Partial<Record<PanelKey, SanityImage | null>>;
  className?: string;
};

const titleClassName =
  "font-owners-narrow-bold text-[9.4vw] leading-[0.9] uppercase md:text-[min(4.4vw,7.6svh)]";

function PanelLabel({
  title,
  className,
  heading = false,
}: {
  title: string;
  className: string;
  heading?: boolean;
}) {
  const Title = heading ? "h2" : "p";

  return (
    <div className="absolute inset-0 flex items-end p-4">
      <Title className={cn(titleClassName, className)}>{title}</Title>
    </div>
  );
}

function FlipPanel({
  href,
  src,
  title,
  lead,
}: {
  href: string;
  src: string;
  title: string;
  lead: string;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const tiles = Array.from(
      board.querySelectorAll<HTMLElement>("[data-flip-tile]"),
    );
    const backs = board.querySelectorAll<HTMLElement>('[data-face="back"]');

    gsap.set(board, { perspective: 1600 });
    gsap.set(tiles, {
      rotateY: 0,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      force3D: true,
    });
    gsap.set(backs, {
      rotateY: 180,
      force3D: true,
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia("(hover: hover)").matches;
    enabledRef.current = !reduceMotion && supportsHover;

    const tl = gsap.timeline({ paused: true });
    FLIP_ORDER.forEach((tileIndex, order) => {
      tl.to(
        tiles[tileIndex],
        { rotateY: 180, duration: 1.05, ease: "sine.inOut" },
        order * 0.055,
      );
    });
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, []);

  const flipTo = (flipped: boolean) => {
    const tl = timelineRef.current;
    if (!enabledRef.current || !tl) return;
    if (flipped) tl.play();
    else tl.reverse();
  };

  return (
    <Link
      href={href}
      aria-label={`${title}. ${lead}`}
      onMouseEnter={() => flipTo(true)}
      onMouseLeave={() => flipTo(false)}
      className="group relative block aspect-3/4 md:aspect-6/7"
    >
      <div
        ref={boardRef}
        className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 gap-(--grid-line) py-(--grid-line)"
        aria-hidden
      >
        {TILES.map((tile) => {
          const mosaic = mosaicBox(tile.col, tile.row, tile.colSpan);

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
                className="absolute inset-0 will-change-transform"
                style={{ transformOrigin: "50% 50%" }}
              >
                {/* Front — photograph. Overflow lives on the inner clip so
                    Safari still honours backface-visibility on this face. */}
                <div
                  data-face="front"
                  className="absolute inset-0 backface-hidden"
                >
                  <div className="absolute inset-0 overflow-hidden bg-sky">
                    <div className="absolute" style={mosaic}>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 48rem) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/20" />
                    {"hasTitle" in tile && tile.hasTitle ? (
                      <PanelLabel title={title} className="text-cream" heading />
                    ) : null}
                  </div>
                </div>

                {/* Back — sky. Pre-rotated 180° in the effect; this face is
                    never swapped, only revealed as the tile turns. */}
                <div
                  data-face="back"
                  className="absolute inset-0 backface-hidden"
                >
                  <div className="absolute inset-0 overflow-hidden bg-sky">
                    {"hasTitle" in tile && tile.hasTitle ? (
                      <PanelLabel title={title} className="text-black" />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}

export function PanelPairFlipSmoothSection({
  copy,
  images,
  className,
}: PanelPairFlipSmoothSectionProps) {
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
                title={copy[panel.key].title}
                lead={copy[panel.key].lead}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
