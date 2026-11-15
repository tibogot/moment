"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * v2 grid — the one from Rond Carré's brand card, and the layout grid at the
 * same time: one layout column per drawn cell.
 *
 * Columns come from --v2-cols (4 / 6 / 8 by breakpoint, globals.css), so a
 * placement like "cells 1–6" means the same thing on every desktop. Rows are
 * the column width × 4/3, so cells stay 3/4 portrait. Sections are a whole
 * number of rows tall and fit exactly; the hero is locked to the screen
 * height, so it rounds to whole rows and lets them stretch a little.
 *
 * Must sit inside a `.v2` wrapper. Type on the grid is marked
 * `data-grid-hole` anywhere in the same section: every cell it touches loses
 * its interior rules, so no line crosses a letter.
 */

/** Width / height of a cell. Portrait, as on the card and the can labels. */
export const CELL_RATIO = 3 / 4;

/**
 * How far a block's content box is grown (positive) or shrunk (negative)
 * before it claims cells. Shrunk by a pixel: blocks carry their own padding
 * for breathing room, and a block that exactly fills its cells — a grid item
 * stretched to its row — must not claim the next row by a rounding pixel,
 * or it merges with the block there.
 */
const HOLE_PADDING = -1;

const LINE = "var(--grid-line)";

type Layout = {
  columns: number;
  rows: number;
  ratio: number;
  /** Cell size in px — the diagonal needs its real angle and length. */
  cellW: number;
  cellH: number;
  /** Cell → the hole blocks covering it (their index among the elements). */
  holes: Map<string, Set<number>>;
};

const key = (column: number, row: number) => `${column}:${row}`;

/** The cell a diagonal goes in, as a holes key. */
const diagonalCell = (
  diagonal: true | "top-left" | "bottom-right",
  { columns, rows }: { columns: number; rows: number },
) => (diagonal === "bottom-right" ? key(columns - 1, rows - 1) : key(0, 0));
const pct = (index: number, total: number) => `${(index / total) * 100}%`;

type CellGridProps = {
  /**
   * Utility class for the rules. `bg-sky` on a `bg-cream` section — the
   * site's convention, which the palette preview flips to cream on sky along
   * with the navbar. Building a section the other way round (sky page, cream
   * rules) makes the preview invert it against the nav.
   */
  lineClassName?: string;
  /**
   * Hero mode: the field sits between the top and bottom bands (the navbar
   * band and its mirror), with the frame rules in the bands. Off for a
   * section, where the field is the whole section between the margins.
   */
  bands?: boolean;
  /**
   * A diagonal through one corner cell, as on the brand card: `true` or
   * "top-left" for the first cell, "bottom-right" for the last. Skipped when
   * that cell is under a `data-grid-hole` block, so it never crosses type.
   */
  diagonal?: boolean | "top-left" | "bottom-right";
  /** Columns × rows · ratio in the bottom band, while we tune. Hero only. */
  readout?: boolean;
  /**
   * Draw the cells. Off keeps only the frame (spines and band rules) — the
   * grid is still there for placement and in the Shift + G overlay, just not
   * on the page.
   */
  cells?: boolean;
};

export function CellGrid({
  lineClassName = "bg-sky",
  bands = true,
  diagonal = false,
  readout = true,
  cells = true,
}: CellGridProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    // The block it rules: a page section, or the footer.
    const section = field?.closest("section, footer");
    if (!field || !section) return;
    const holeElements = Array.from(
      section.querySelectorAll<HTMLElement>("[data-grid-hole]"),
    );

    const update = () => {
      const box = field.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const columns =
        parseInt(getComputedStyle(field).getPropertyValue("--v2-cols"), 10) ||
        4;
      const cellW = box.width / columns;
      const rows = Math.max(1, Math.round(box.height / (cellW / CELL_RATIO)));
      const cellH = box.height / rows;

      const holes = new Map<string, Set<number>>();
      holeElements.forEach((element, index) => {
        // The content box, not the border box: blocks carry the gutter as
        // padding, and that padding sits inside their own cells — measured
        // with it, a block spanning cells 1–7 would also claim cell 8.
        const r = element.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const style = getComputedStyle(element);
        const left = r.left + parseFloat(style.paddingLeft) - box.left;
        const right = r.right - parseFloat(style.paddingRight) - box.left;
        const top = r.top + parseFloat(style.paddingTop) - box.top;
        const bottom = r.bottom - parseFloat(style.paddingBottom) - box.top;
        const c0 = Math.floor((left - HOLE_PADDING) / cellW);
        const c1 = Math.floor((right + HOLE_PADDING) / cellW);
        const r0 = Math.floor((top - HOLE_PADDING) / cellH);
        const r1 = Math.floor((bottom + HOLE_PADDING) / cellH);
        for (let c = Math.max(0, c0); c <= Math.min(columns - 1, c1); c++)
          for (let row = Math.max(0, r0); row <= Math.min(rows - 1, r1); row++)
            holes.set(
              key(c, row),
              (holes.get(key(c, row)) ?? new Set()).add(index),
            );
      });
      setLayout({ columns, rows, ratio: cellW / cellH, cellW, cellH, holes });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(field);
    holeElements.forEach((element) => observer.observe(element));
    // Webfonts change the size of the type after the first measure.
    document.fonts?.ready.then(update);
    return () => observer.disconnect();
  }, []);

  const segments: ReactNode[] = [];
  const labels: ReactNode[] = [];
  if (layout) {
    const { columns, rows, holes } = layout;
    // A rule is dropped only *inside* one block: both cells under the same
    // `data-grid-hole` element. Two blocks side by side keep the rule between
    // them, so each reads as its own box — like the panels on the can labels —
    // instead of merging into one shape.
    const sameHole = (c1: number, r1: number, c2: number, r2: number) => {
      const a = holes.get(key(c1, r1));
      const b = holes.get(key(c2, r2));
      if (!a || !b) return false;
      for (const index of a) if (b.has(index)) return true;
      return false;
    };

    // Interior verticals, one cell tall at a time.
    for (let b = 1; b < columns; b++)
      for (let r = 0; r < rows; r++) {
        if (sameHole(b - 1, r, b, r)) continue;
        segments.push(
          <span
            key={`v${b}-${r}`}
            className={cn("absolute", lineClassName)}
            style={{
              width: LINE,
              left: pct(b, columns),
              top: pct(r, rows),
              height: pct(1, rows),
              transform: "translateX(-50%)",
            }}
          />,
        );
      }

    // Interior horizontals, one cell wide at a time, same rule.
    for (let b = 1; b < rows; b++)
      for (let c = 0; c < columns; c++) {
        if (sameHole(c, b - 1, c, b)) continue;
        segments.push(
          <span
            key={`h${b}-${c}`}
            className={cn("absolute", lineClassName)}
            style={{
              height: LINE,
              top: pct(b, rows),
              left: pct(c, columns),
              width: pct(1, columns),
              transform: "translateY(-50%)",
            }}
          />,
        );
      }

    // Overlay: every cell tinted on alternate columns and labelled
    // column·row, 1-based — the numbers to use in a placement.
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < columns; c++)
        labels.push(
          <span
            key={`l${c}-${r}`}
            className={cn(
              "absolute font-mono text-[10px] leading-none text-[#e5007d]",
              c % 2 === 0 && "bg-[#e5007d]/8",
            )}
            style={{
              left: pct(c, columns),
              top: pct(r, rows),
              width: pct(1, columns),
              height: pct(1, rows),
              padding: "var(--v2-pad)",
            }}
          >
            {c + 1}·{r + 1}
          </span>,
        );
  }

  // Hero: the frame horizontals sit *outside* the field, inside the bands.
  // The navbar draws its rule as a border-bottom, which border-box keeps
  // inside its --grid-band height — so it occupies band − line → band. A
  // rule at `top: band` would start where that one ends and the two would
  // read as one double-thick line. The bottom rule mirrors it.
  // Section: one rule along the top edge; the next section draws the one
  // below, so two sections never stack two lines.
  const band = bands ? "var(--grid-band)" : "0px";

  return (
    <>
      {/* Frame: the two spines and the horizontals run full bleed, crossing
          at the corners like the brand-book pages. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span
          className={cn("absolute inset-y-0", lineClassName)}
          style={{ width: LINE, left: "var(--grid-margin)" }}
        />
        <span
          className={cn("absolute inset-y-0", lineClassName)}
          style={{ width: LINE, right: "var(--grid-margin)" }}
        />
        <span
          className={cn("absolute inset-x-0", lineClassName)}
          style={{
            height: LINE,
            top: bands ? `calc(${band} - ${LINE})` : 0,
          }}
        />
        {bands && (
          <span
            className={cn("absolute inset-x-0", lineClassName)}
            style={{ height: LINE, bottom: `calc(${band} - ${LINE})` }}
          />
        )}
      </div>

      {/* Field: the area inside the frame, measured to pick the rows. */}
      <div
        ref={fieldRef}
        className="pointer-events-none absolute"
        style={{
          left: "var(--grid-margin)",
          right: "var(--grid-margin)",
          top: band,
          bottom: band,
        }}
        aria-hidden
      >
        {layout && (
          <div className="absolute inset-0 animate-[v2-fade_0.6s_ease-out]">
            {cells && segments}
            {cells &&
              diagonal &&
              !layout.holes.has(diagonalCell(diagonal, layout)) && (
                // A bar of the same class as the rules, rotated corner to
                // corner — not an SVG stroke: a stroke would need a text-*
                // colour class, which Tailwind never generates when it is
                // built at runtime, and which the palette preview does not
                // remap. Same class means same colour, preview included.
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{
                    width: pct(1, layout.columns),
                    height: pct(1, layout.rows),
                    ...(diagonal === "bottom-right" && {
                      left: pct(layout.columns - 1, layout.columns),
                      top: pct(layout.rows - 1, layout.rows),
                    }),
                  }}
                >
                  <span
                    className={cn("absolute top-1/2 left-1/2", lineClassName)}
                    style={{
                      width: `${Math.hypot(layout.cellW, layout.cellH)}px`,
                      height: LINE,
                      // "/": bottom-left corner to top-right.
                      transform: `translate(-50%, -50%) rotate(${-(Math.atan2(layout.cellH, layout.cellW) * 180) / Math.PI}deg)`,
                    }}
                  />
                </div>
              )}
          </div>
        )}
        {layout && <div className="v2-debug absolute inset-0">{labels}</div>}
      </div>

      {bands && readout && layout && (
        <p
          className="font-archivo-light pointer-events-none absolute bottom-0 flex items-center text-[12px] text-black tabular-nums"
          style={{
            height: "var(--grid-band)",
            right: "calc(var(--grid-margin) + var(--grid-gutter) / 2)",
          }}
          aria-hidden
        >
          {layout.columns} × {layout.rows} · {layout.ratio.toFixed(2)}
        </p>
      )}
    </>
  );
}
