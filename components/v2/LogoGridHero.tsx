"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { CellGrid, centredRows } from "@/components/v2/CellGrid";

/**
 * The hero again — full screen, the same subdivided grid (12 columns on
 * desktop, 9 on tablet, 4 on a phone) — with the logotype set among the
 * cells the way Rond Carré's own visuals do it: small, in ONE row of the
 * grid, on a few cells in the middle. Only those cells are cleared (a
 * `data-grid-hole`); every row above and below stays ruled, so the grid runs
 * all round the logo.
 *
 * The slot is measured against the same rows CellGrid draws
 * (`centredRows`), so it always lands exactly on cells: the row at the
 * exact centre of the screen, about a third of the columns wide (half on a
 * phone), centred. The logo takes 70% of the slot's width, which leaves at least
 * the width of the "m" free on each side (the charter's exclusion zone) and
 * keeps it well above the 45px digital minimum.
 */

type Slot = {
  left: number;
  top: number;
  width: number;
  height: number;
  logoWidth: number;
};

/** The logotype file's proportions. */
const LOGO_RATIO = 1437 / 220;

/**
 * `subdivide` as in CellGrid (1.5: 12 / 9 / 4 columns; 3: 24 / 18 / 4).
 * `stretch`: always whole odd rows, the cells stretched a little to fill
 * exactly 100svh, instead of cutting the outer rows.
 * `logoCells`: how many cells the logo takes from tablet up (default about a
 * third of the columns); a phone keeps half of its 4. `logoFill`: the share
 * of that width the logo takes (default 0.7).
 */
export function LogoGridHero({
  subdivide = 1.5,
  stretch = false,
  logoCells,
  logoFill = 0.7,
}: {
  subdivide?: number;
  stretch?: boolean;
  logoCells?: number;
  logoFill?: number;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const update = () => {
      const { width, height } = field.getBoundingClientRect();
      if (!width || !height) return;
      // Same columns and rows as CellGrid.
      const pageColumns =
        parseInt(getComputedStyle(field).getPropertyValue("--v2-cols"), 10) ||
        4;
      const columns =
        pageColumns >= 6 ? Math.round(pageColumns * subdivide) : pageColumns;
      const cellW = width / columns;
      // The same rows as CellGrid with centreRow: one exactly at the centre.
      const { edges, middle } = centredRows(height, cellW, stretch);

      const rowH = edges[middle + 1] - edges[middle];
      // logoCells from tablet up, else about a third of the columns; half on
      // a phone. As many cells left as right.
      const target = pageColumns < 6 ? columns / 2 : (logoCells ?? columns / 3);
      let span = columns % 2 ? 1 : 2;
      for (let s = span; s <= columns; s += 2)
        if (Math.abs(s - target) <= Math.abs(span - target)) span = s;
      const startColumn = (columns - span) / 2;
      setSlot({
        left: startColumn * cellW,
        top: edges[middle],
        width: span * cellW,
        height: rowH,
        // logoFill of the slot, and never taller than 55% of the row.
        logoWidth: Math.min(logoFill * span * cellW, 0.55 * rowH * LOGO_RATIO),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(field);
    return () => observer.disconnect();
  }, [subdivide, stretch, logoCells, logoFill]);

  return (
    <section className="relative h-svh w-full overflow-hidden bg-cream">
      <CellGrid
        lineClassName="bg-sky"
        // The ratio in the bottom band while we compare the stretched one.
        readout={stretch}
        subdivide={subdivide}
        centreRow={stretch ? "stretch" : true}
      />

      {/* The field, where the slot is placed. */}
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
        {/* Sized from the measure, so CellGrid sees it resize and clears
            exactly its cells. Zero-sized until then: nothing cleared. */}
        <div
          data-grid-hole
          className="absolute flex items-center justify-center"
          style={
            slot
              ? {
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                }
              : { width: 0, height: 0 }
          }
        >
          {slot && (
            <Image
              src="/brand/Moment-Logotype.svg"
              alt="Moment"
              width={1437}
              height={220}
              // The file is cream for the navbar; black here, as in the
              // charter.
              className="h-auto brightness-0"
              style={{ width: slot.logoWidth }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
