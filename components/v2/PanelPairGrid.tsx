"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
// Sanity URLs skip Next's optimiser; see CdnImage.
import { CdnImage as Image } from "@/components/CdnImage";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { gsap } from "@/lib/gsap";
import { routes } from "@/lib/routes";
import { urlFor } from "@/lib/sanity/image";
import type { SanityDecorativeImage } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

/**
 * The home page's two panels — Événements, Comptoir café — on the v2 grid.
 * v1 (`components/PanelPairFlipSmoothSection.tsx`) is untouched and still
 * on the v1 home.
 *
 * Same behaviour as v1: the photograph cut into tiles, each tile a real
 * 0→180° card (photo front, sky back), one paused timeline per panel played
 * on hover and reversed on leave, perspective on the board so the mosaic
 * shares one camera. Off for reduced motion and for touch.
 *
 * What changed is the cut: the photograph is cut into the panel's cells —
 * same count, same 3/4 proportions — and each panel sits inside its block of
 * cells, half a gutter in, so the two are one gutter apart as in v1.
 *   mobile   4 cols   panels stacked, each 4 × 4 cells
 *   tablet   6 cols   side by side, each 3 × 3 cells
 *   desktop  8 cols   side by side, each 4 × 4 cells (cells 1–4, 5–8)
 * As many rows as columns, always: a square block of 3/4 cells is itself a
 * 3/4 rectangle, so every panel has the cell's shape — never a square.
 * The title sits on a merged tile bottom-left, as in v1 — three cells of
 * four, two of three, so the longest title fits.
 *
 * Not a section: it renders inside the intro section (IntroGridSection's
 * children), under the text. Each panel draws its own rules — cream gaps
 * between tiles, as in v1, which stay still while the tiles turn.
 */

const LINE = "var(--grid-line)";

type Layout = { cols: number; rows: number };
const LAYOUTS: Record<"mobile" | "tablet" | "desktop", Layout> = {
  mobile: { cols: 4, rows: 4 },
  tablet: { cols: 3, rows: 3 },
  desktop: { cols: 4, rows: 4 },
};

/* The breakpoint, matching --v2-cols in globals.css (48rem, 64rem). */
const TABLET_MQ = "(width >= 48rem)";
const DESKTOP_MQ = "(width >= 64rem)";

function subscribe(onChange: () => void) {
  const queries = [TABLET_MQ, DESKTOP_MQ].map((q) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () =>
    queries.forEach((q) => q.removeEventListener("change", onChange));
}
const getSnapshot = () =>
  window.matchMedia(DESKTOP_MQ).matches
    ? "desktop"
    : window.matchMedia(TABLET_MQ).matches
      ? "tablet"
      : "mobile";
// The server renders desktop; a phone re-renders after hydration.
const getServerSnapshot = () => "desktop" as const;

type Tile = { key: string; col: number; row: number; span: number };

/**
 * How many cells the title tile spans, bottom-left: wide enough for
 * "ÉVÉNEMENTS" at its size — three cells of four, two of three.
 */
const titleSpan = (cols: number) => (cols >= 4 ? 3 : 2);

/** Every cell a tile, except the title's cells bottom-left, merged. */
function tilesFor({ cols, rows }: Layout): Tile[] {
  const tiles: Tile[] = [];
  const span = titleSpan(cols);
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      const inTitle = row === rows - 1 && col < span;
      if (inTitle && col > 0) continue; // covered by the title tile
      tiles.push({
        key: `${col}-${row}`,
        col,
        row,
        span: inTitle ? span : 1,
      });
    }
  return tiles;
}

const TITLE_KEY = (rows: number) => `0-${rows - 1}`;

/**
 * The order the tiles turn in: scattered, like v1's hand-picked sequence,
 * but for any tile count. A fixed shuffle, so it is the same every time.
 */
function flipOrder(count: number) {
  return Array.from({ length: count }, (_, i) => i).sort(
    (a, b) => ((a * 7 + 3) % 11) - ((b * 7 + 3) % 11) || a - b,
  );
}

const panels = [
  { key: "events", href: routes.events, src: "/images/onur-kaya.jpg" },
  { key: "coffee", href: routes.coffee, src: "/images/oak-bond-coffee.jpg" },
] as const;

type PanelKey = (typeof panels)[number]["key"];

const titleClassName =
  "font-owners-narrow-bold text-[9.4vw] leading-[0.9] uppercase md:text-[min(4.4vw,7.6svh)]";

function FlipPanel({
  href,
  src,
  title,
  lead,
  layout,
  className,
}: {
  href: string;
  src: string;
  title: string;
  lead: string;
  layout: Layout;
  className: string;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const enabledRef = useRef(false);
  const tiles = tilesFor(layout);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const tileEls = Array.from(
      board.querySelectorAll<HTMLElement>("[data-flip-tile]"),
    );
    const backs = board.querySelectorAll<HTMLElement>('[data-face="back"]');

    gsap.set(board, { perspective: 1600 });
    gsap.set(tileEls, {
      rotateY: 0,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      force3D: true,
    });
    gsap.set(backs, { rotateY: 180, force3D: true });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia("(hover: hover)").matches;
    enabledRef.current = !reduceMotion && supportsHover;

    // Same timing as v1: 1.05 s a tile, 55 ms apart.
    const tl = gsap.timeline({ paused: true });
    flipOrder(tileEls.length).forEach((index, order) => {
      tl.to(
        tileEls[index],
        { rotateY: 180, duration: 1.05, ease: "sine.inOut" },
        order * 0.055,
      );
    });
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
    // A new layout is a new set of tiles: rebuild the timeline for it.
  }, [layout]);

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
      data-grid-hole
      className={cn("group relative block", className)}
    >
      {/*
        The board sits inside the panel's block of cells. Outer edges are
        inset a full gutter, so they line up with the text and the navbar
        (as v1's panels do); the inner edges half a gutter each, so the two
        panels are one gutter apart (v1's gap). Tiles still cut
        the board into the block's cells — same count, same proportions.
        `container-type: size` lets each tile size its slice of the
        photograph against the whole board (100cqw × 100cqh).
      */}
      <div
        ref={boardRef}
        className="pointer-events-none absolute grid [container-type:size]"
        style={{
          // --panel-left / --panel-right are set per panel (see below).
          // Top-anchored, except the first panel on a phone, which sits on
          // the bottom of its block so the two stacked panels are exactly
          // one gutter apart (the block's spare height goes above it).
          top: "var(--panel-top, calc(var(--grid-gutter) / 2))",
          bottom: "var(--panel-bottom, auto)",
          // Height from the width: exactly 3/4, like a cell, so the tiles
          // inside are exact cells too. Whatever is left of the block's
          // height falls below the panel.
          aspectRatio: "3 / 4",
          left: "var(--panel-left)",
          right: "var(--panel-right)",
          gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
          gap: LINE,
          padding: `calc(${LINE} / 2)`,
        }}
        aria-hidden
      >
        {tiles.map((tile) => {
          const isTitle = tile.key === TITLE_KEY(layout.rows);
          // This tile's slice of the board-sized photograph.
          const slice = {
            width: "100cqw",
            height: "100cqh",
            left: `calc(-1 * (${LINE} / 2 + ${tile.col} * 100cqw / ${layout.cols}))`,
            top: `calc(-1 * (${LINE} / 2 + ${tile.row} * 100cqh / ${layout.rows}))`,
          };

          return (
            <div
              key={tile.key}
              className="relative"
              style={{
                gridColumn: `${tile.col + 1} / span ${tile.span}`,
                gridRow: tile.row + 1,
              }}
            >
              <div
                data-flip-tile
                className="absolute inset-0 will-change-transform"
              >
                {/* Front — photograph. Overflow on the inner clip so Safari
                    still honours backface-visibility on this face. */}
                <div
                  data-face="front"
                  className="absolute inset-0 backface-hidden"
                >
                  <div className="absolute inset-0 overflow-hidden bg-sky">
                    <div className="absolute" style={slice}>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 48rem) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/20" />
                    {isTitle && (
                      <div className="absolute inset-0 flex items-end p-(--v2-pad)">
                        <h2 className={cn(titleClassName, "text-cream")}>
                          {title}
                        </h2>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back — sky, pre-rotated 180° in the effect. */}
                <div
                  data-face="back"
                  className="absolute inset-0 backface-hidden"
                >
                  <div className="absolute inset-0 overflow-hidden bg-sky">
                    {isTitle && (
                      <div className="absolute inset-0 flex items-end p-(--v2-pad)">
                        <p className={cn(titleClassName, "text-black")}>
                          {title}
                        </p>
                      </div>
                    )}
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

type PanelPairGridProps = {
  copy: Record<PanelKey, { title: string; lead: string }>;
  images?: Partial<Record<PanelKey, SanityDecorativeImage | null>>;
};

export function PanelPairGrid({ copy, images }: PanelPairGridProps) {
  const size = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const layout = LAYOUTS[size];

  const sourceFor = (key: PanelKey, fallback: string) => {
    const image = images?.[key];
    return image ? urlFor(image).width(1600).auto("format").url() : fallback;
  };

  // Not a section of its own: it sits inside the intro section, under the
  // text, on the same columns — one section, no band or rule between them.
  // Placed in the parent's grid across every cell column, as a subgrid, so
  // column 1 here is cell 1. Rows are 3/4 cells; stacked on a phone (4 + 4
  // rows), side by side on tablet (3 rows) and desktop (4).
  return (
    <div
      className="col-[2/span_4] grid grid-cols-subgrid [--rows:8] md:col-[2/span_6] md:[--rows:3] lg:[--rows:4] lg:col-[2/span_8]"
      style={{ gridTemplateRows: "repeat(var(--rows), var(--v2-row))" }}
    >
      {panels.map((panel, index) => (
        <FlipPanel
          key={panel.key}
          href={panel.href}
          src={sourceFor(panel.key, panel.src)}
          title={copy[panel.key].title}
          lead={copy[panel.key].lead}
          layout={layout}
          className={
            index === 0
              ? "col-[1/span_4] row-[1/span_4] [--panel-top:auto] [--panel-bottom:calc(var(--grid-gutter)/2)] md:[--panel-top:calc(var(--grid-gutter)/2)] md:[--panel-bottom:auto] [--panel-left:var(--grid-gutter)] [--panel-right:var(--grid-gutter)] md:col-[1/span_3] md:row-[1/span_3] md:[--panel-right:calc(var(--grid-gutter)/2)] lg:col-[1/span_4] lg:row-[1/span_4]"
              : "col-[1/span_4] row-[5/span_4] [--panel-left:var(--grid-gutter)] [--panel-right:var(--grid-gutter)] md:col-[4/span_3] md:row-[1/span_3] md:[--panel-left:calc(var(--grid-gutter)/2)] lg:col-[5/span_4] lg:row-[1/span_4]"
          }
        />
      ))}
    </div>
  );
}
