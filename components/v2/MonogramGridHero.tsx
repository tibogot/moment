"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CELL_RATIO, CellGrid } from "@/components/v2/CellGrid";

/**
 * Full screen, the large monogram set into the grid (22 November 2026): the
 * "m" centred in the cell at the exact centre of the screen, each
 * parenthesis centred in the cell beside it — the charter's "moment entre
 * parenthèses", the grid of appointments isolating one.
 *
 * A cell at the exact centre needs an odd number of columns and of rows, so
 * this section picks its own grid rather than the hero's: odd columns around
 * 13 on desktop (11–15), 9 on tablet (7–11), 5 on a phone, each with the odd
 * row count that fills exactly 100svh, keeping the pair whose cells come
 * closest to 3/4.
 *
 * The three glyphs are the paths of Moment-monogram-L.svg, each drawn on its
 * own but on one shared vertical box, so they keep the file's scale and
 * baseline.
 */

/** Shared vertical box: the parentheses' top and bottom in the file. */
const TOP = 277.407;
const HEIGHT = 220.528;
const M_WIDTH = 241.256;

const GLYPHS = {
  open: {
    x: 240.156,
    width: 92.157,
    d: "M240.156,387.813c0-44.96,21.483-86.416,53.194-110.406h38.963c-35.971,32.723-53.693,67.184-53.693,110.15c0,43.208,17.722,77.925,53.693,110.378H293.35C261.639,473.972,240.156,432.759,240.156,387.813z",
  },
  m: {
    x: 838.956,
    width: M_WIDTH,
    d: "M838.956,315.871h36.213v18.99c11.226-13.747,27.965-21.982,47.952-21.982c21.227,0,38.208,8.989,47.197,24.475c12.494-15.243,30.729-24.475,53.437-24.475c33.977,0,56.443,21.227,56.443,54.192v85.162h-35.957v-79.92c0-21.967-13.733-33.207-33.222-33.207c-13.99,0-25.956,5.998-34.461,15.485c0.755,3.989,1.254,7.992,1.254,12.479v85.162h-36.213v-79.92c0-21.967-12.992-33.207-31.469-33.207c-14.987,0-27.723,6.995-34.96,17.223v95.904h-36.213V315.871z",
  },
  close: {
    x: 1586.856,
    width: 92.142,
    d: "M1678.998,387.556c0,44.96-21.469,86.416-53.194,110.378h-38.948c35.957-32.709,53.693-67.17,53.693-110.121c0-43.222-17.736-77.925-53.693-110.406h38.948C1657.529,301.397,1678.998,342.596,1678.998,387.556z",
  },
} as const;

/** The "m" takes this share of its cell's width. */
const M_SHARE = 0.55;

type Grid = { columns: number; rows: number; cellW: number; cellH: number };

const odd = (value: number) => Math.max(1, 2 * Math.round((value - 1) / 2) + 1);

function pickGrid(width: number, height: number, pageColumns: number): Grid {
  const candidates =
    pageColumns >= 8 ? [13, 11, 15] : pageColumns >= 6 ? [9, 7, 11] : [5];
  let best: Grid | null = null;
  for (const columns of candidates) {
    const cellW = width / columns;
    const rows = odd(height / (cellW / CELL_RATIO));
    const cellH = height / rows;
    const grid = { columns, rows, cellW, cellH };
    // The first candidate wins unless another is clearly closer to 3/4.
    if (
      !best ||
      Math.abs(cellW / cellH - CELL_RATIO) <
        Math.abs(best.cellW / best.cellH - CELL_RATIO) - 0.01
    )
      best = grid;
  }
  return best!;
}

export function MonogramGridHero() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<Grid | null>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const update = () => {
      const { width, height } = field.getBoundingClientRect();
      if (!width || !height) return;
      const pageColumns =
        parseInt(getComputedStyle(field).getPropertyValue("--v2-cols"), 10) ||
        4;
      setGrid(pickGrid(width, height, pageColumns));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  // One scale for the three glyphs, set by the "m".
  const scale = grid ? (M_SHARE * grid.cellW) / M_WIDTH : 0;
  const middleColumn = grid ? (grid.columns - 1) / 2 : 0;
  const middleRow = grid ? (grid.rows - 1) / 2 : 0;

  return (
    <section className="relative h-svh w-full overflow-hidden bg-cream">
      <CellGrid
        lineClassName="bg-sky"
        columns={grid?.columns}
        rows={grid?.rows}
      />

      <div
        ref={fieldRef}
        className="absolute"
        style={{
          left: "var(--grid-margin)",
          right: "var(--grid-margin)",
          top: "var(--grid-band)",
          bottom: "var(--grid-band)",
        }}
      >
        {grid && (
          <div role="img" aria-label="Moment">
            {(["open", "m", "close"] as const).map((name, index) => {
              const glyph = GLYPHS[name];
              return (
                <div
                  key={name}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: (middleColumn - 1 + index) * grid.cellW,
                    top: middleRow * grid.cellH,
                    width: grid.cellW,
                    height: grid.cellH,
                  }}
                >
                  <svg
                    viewBox={`${glyph.x} ${TOP} ${glyph.width} ${HEIGHT}`}
                    width={glyph.width * scale}
                    height={HEIGHT * scale}
                    className="fill-black"
                    aria-hidden
                  >
                    <path d={glyph.d} />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
