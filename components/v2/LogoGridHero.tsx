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
 * exact centre of the screen, 4 cells wide on desktop, 3 on tablet, 2 on a
 * phone, centred. The logo takes 70% of the slot's width, which leaves at least
 * the width of the "m" free on each side (the charter's exclusion zone) and
 * keeps it well above the 45px digital minimum.
 */

type Slot = { left: number; top: number; width: number; height: number };

export function LogoGridHero() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const update = () => {
      const { width, height } = field.getBoundingClientRect();
      if (!width || !height) return;
      // Same columns and rows as CellGrid with subdivide={1.5}.
      const pageColumns =
        parseInt(getComputedStyle(field).getPropertyValue("--v2-cols"), 10) ||
        4;
      const columns =
        pageColumns >= 6 ? Math.round(pageColumns * 1.5) : pageColumns;
      const cellW = width / columns;
      // The same rows as CellGrid with centreRow: one exactly at the centre.
      const { edges, middle } = centredRows(height, cellW);

      const span = columns >= 12 ? 4 : columns >= 9 ? 3 : 2;
      const startColumn = Math.floor((columns - span) / 2);
      setSlot({
        left: startColumn * cellW,
        top: edges[middle],
        width: span * cellW,
        height: edges[middle + 1] - edges[middle],
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative h-svh w-full overflow-hidden bg-cream">
      <CellGrid
        lineClassName="bg-sky"
        readout={false}
        subdivide={1.5}
        centreRow
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
              className="h-auto w-[70%] brightness-0"
            />
          )}
        </div>
      </div>
    </section>
  );
}
