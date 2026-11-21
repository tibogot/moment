"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { CellGrid } from "@/components/v2/CellGrid";

/**
 * Rond Carré's tissue-paper print ("Papier de soie"), reproduced as a
 * section: a fine grid of small cells with the ( m ) monogram set in a
 * brick pattern.
 *
 * Measured on the print:
 * - cells about 31 × 46 — a 2/3 rectangle (0.67), finer than the page cells;
 * - a ( m ) covers three cells, one character centred in each, with no rule
 *   inside the three;
 * - rows go monogram row, plain row, monogram row shifted by three cells,
 *   plain row — repeating every four rows and every six columns;
 * - the pattern runs on past the frame: an edge monogram's bracket lands in
 *   the margin, while the vertical rules stop at the frame and the
 *   horizontal ones run nearly full width.
 *
 * Here: 5 small cells per page column (40 across on desktop, 30 on tablet,
 * 12 on a phone at 3 per column), 20 rows, everything in --palette-line so
 * the palette preview recolours it.
 */

/** Width / height of a pattern cell, as on the print. */
const PATTERN_RATIO = 2 / 3;
const ROWS = 20;

type Measure = { width: number; left: number; cell: number; cols: number };

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Which three-cell block a column belongs to in a monogram row, or null.
 * Row type 0 has its blocks on columns 2–4, 8–10…; row type 2 on columns
 * −1–1, 5–7… — three cells further, which is what makes the brick.
 */
function blockStart(col: number, rowType: 0 | 2): number | null {
  const offset = rowType === 0 ? 2 : 5;
  const inBlock = mod(col - offset, 6);
  return inBlock < 3 ? col - inBlock : null;
}

export function MonogramPatternSection() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<Measure | null>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    const section = field?.closest("section");
    if (!field || !section) return;
    const update = () => {
      const s = section.getBoundingClientRect();
      const f = field.getBoundingClientRect();
      const cols =
        parseInt(
          getComputedStyle(section).getPropertyValue("--pat-cols"),
          10,
        ) || 12;
      setM({
        width: s.width,
        left: f.left - s.left,
        cell: f.width / cols,
        cols,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const lines: ReactNode[] = [];
  const glyphs: ReactNode[] = [];

  if (m) {
    const { width, left, cell, cols } = m;
    const h = cell / PATTERN_RATIO;
    const x = (c: number) => left + c * cell;

    // Horizontal rules: every row boundary, nearly full width as on the
    // print (the first and last coincide with the frame's band rules).
    for (let r = 1; r < ROWS; r++)
      lines.push(
        <line key={`h${r}`} x1={0} x2={width} y1={r * h} y2={r * h} />,
      );

    // Vertical rules, inside the frame only, row by row: skipped between two
    // cells of the same monogram block.
    for (let r = 0; r < ROWS; r++) {
      const type = r % 4;
      for (let b = 1; b < cols; b++) {
        if (type === 0 || type === 2) {
          const a = blockStart(b - 1, type);
          if (a !== null && a === blockStart(b, type)) continue;
        }
        lines.push(
          <line
            key={`v${r}-${b}`}
            x1={x(b)}
            x2={x(b)}
            y1={r * h}
            y2={(r + 1) * h}
          />,
        );
      }
    }

    // Monograms: ( m ) one character per cell, including blocks that start
    // or end past the frame — their brackets sit in the margin.
    const firstCol = Math.floor(-left / cell) - 3;
    const lastCol = Math.ceil((width - left) / cell) + 3;
    for (let r = 0; r < ROWS; r++) {
      const type = r % 4;
      if (type !== 0 && type !== 2) continue;
      for (let c = firstCol; c <= lastCol; c++) {
        if (blockStart(c, type) !== c) continue;
        ["(", "m", ")"].forEach((char, i) => {
          // As on the print: only the character in the cell just outside
          // the frame spills into the margin, never one further out.
          const col = c + i;
          if (col < -1 || col > cols) return;
          const cx = x(col + 0.5);
          if (cx < 0 || cx > width) return;
          glyphs.push(
            <text key={`t${r}-${c}-${i}`} x={cx} y={(r + 0.5) * h}>
              {char}
            </text>,
          );
        });
      }
    }
  }

  const height = m ? (ROWS * m.cell) / PATTERN_RATIO : 0;

  return (
    <section
      className="relative w-full bg-cream [--pat-cols:12] md:[--pat-cols:30] lg:[--pat-cols:40]"
      style={{
        // Two bands plus 20 rows of 2/3 cells, the cell being the field's
        // width over --pat-cols: set in CSS, so no jump before measuring.
        height: `calc(2 * var(--grid-band) + ${ROWS} * (100cqw - 2 * var(--grid-margin)) / var(--pat-cols) / ${PATTERN_RATIO})`,
      }}
      aria-hidden
    >
      <CellGrid lineClassName="bg-sky" readout={false} cells={false} />

      {/* The field — measured for the cell size. */}
      <div
        ref={fieldRef}
        className="pointer-events-none absolute"
        style={{
          left: "var(--grid-margin)",
          right: "var(--grid-margin)",
          top: "var(--grid-band)",
          bottom: "var(--grid-band)",
        }}
      />

      {m && (
        <svg
          className="pointer-events-none absolute inset-x-0 animate-[v2-fade_0.6s_ease-out]"
          style={{ top: "var(--grid-band)" }}
          width={m.width}
          height={height}
        >
          <g
            stroke="var(--palette-line)"
            strokeWidth={1}
            shapeRendering="crispEdges"
          >
            {lines}
          </g>
          <g
            fill="var(--palette-line)"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontFamily: "var(--font-face-owners-medium)",
              fontSize: `${(m.cell / PATTERN_RATIO) * 0.34}px`,
            }}
          >
            {glyphs}
          </g>
        </svg>
      )}
    </section>
  );
}
