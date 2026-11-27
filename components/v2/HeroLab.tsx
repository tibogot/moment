import type { CSSProperties, ReactNode } from "react";
import { CellGrid } from "@/components/v2/CellGrid";
import { cn } from "@/lib/utils";

/**
 * Hero lab (27 November 2026): three directions for the home hero without a
 * photograph, on the visible grid — black type that never has to fight an
 * image. The owners' five words and their signature. Test bench only
 * (app/[lang]/v2/hero); nothing here is on the real home yet.
 *
 * Placement is in cells, as everywhere on /v2: cell n is grid column n + 1
 * (column 1 is the left margin) — 16 cells on desktop, 12 on a tablet, 4 on a
 * phone, each 3/4. Words come in one after another with the `hero-word`
 * animation (globals.css); the calendar's slots with `lab-slot`.
 */

const WORDS = ["Brunch", "Lunch", "Catering", "Coffee cart", "Delivery"];
const SIGNATURE = "( Life is moments )";

function LabSection({
  label,
  rows,
  children,
}: {
  label: string;
  /** `[--rows:n]` classes per breakpoint. */
  rows: string;
  children: ReactNode;
}) {
  return (
    <section className="relative w-full bg-cream text-black">
      <CellGrid lineClassName="bg-sky" readout={false} subdivide={2} />
      <p className="font-owners-medium absolute top-0 left-(--grid-margin) z-10 flex h-(--grid-band) items-center px-(--v2-pad) text-[11px] tracking-wide uppercase opacity-50">
        {label}
      </p>
      <div
        className={cn("relative grid", rows)}
        style={{
          gridTemplateColumns: "var(--s-grid-columns)",
          gridTemplateRows: "repeat(var(--rows), var(--s-cell-h))",
          paddingBlock: "var(--grid-band)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

const beat = (index: number) =>
  ({ "--hero-word-index": index }) as CSSProperties;

/** A — the five words stacked, one row of cells each. */
export function HeroLabRows() {
  return (
    <LabSection label="A — Un mot par rangée" rows="[--rows:6] md:[--rows:6]">
      {WORDS.map((word, index) => (
        <p
          key={word}
          className="hero-word font-owners-narrow-bold col-[2/span_4] flex items-center px-(--v2-pad) text-[min(14vw,calc(var(--s-cell-h)*0.62))] leading-none tracking-[-0.005em] uppercase md:col-[2/span_12] lg:col-[2/span_16]"
          style={{ ...beat(index), gridRow: index + 1 }}
        >
          <span className="bg-cream pr-[0.15em]">{word}</span>
        </p>
      ))}
      <p
        className="hero-word font-owners-medium col-[2/span_4] row-[6] flex items-center justify-end px-(--v2-pad) text-[13px] tracking-wide uppercase md:col-[8/span_6] lg:col-[10/span_8] md:text-[15px]"
        style={beat(WORDS.length + 1)}
      >
        {SIGNATURE}
      </p>
    </LabSection>
  );
}

/**
 * B — the calendar: the words as booked slots in the grid (the brief: the
 * grid is a calendar), the signature across the middle.
 */
const SLOTS = [
  // [mobile col, row, span], [tablet col, row, span], [desktop col, row, span]
  { word: "Brunch", m: [1, 1, 2], t: [1, 1, 3], d: [1, 1, 3] },
  { word: "Lunch", m: [3, 2, 2], t: [6, 2, 3], d: [7, 2, 3] },
  { word: "Catering", m: [2, 6, 3], t: [9, 1, 4], d: [12, 1, 4] },
  { word: "Coffee cart", m: [1, 7, 3], t: [2, 6, 4], d: [3, 6, 4] },
  { word: "Delivery", m: [3, 5, 2], t: [8, 5, 3], d: [12, 5, 3] },
] as const;

export function HeroLabCalendar() {
  return (
    <LabSection
      label="B — Le calendrier"
      rows="[--rows:7] md:[--rows:6] lg:[--rows:6]"
    >
      {SLOTS.map(({ word, m, t, d }, index) => (
        <div
          key={word}
          data-grid-hole
          className="lab-slot relative bg-sky [grid-column:var(--c)/span_var(--s)] [grid-row:var(--r)] md:[grid-column:var(--tc)/span_var(--ts)] md:[grid-row:var(--tr)] lg:[grid-column:var(--dc)/span_var(--ds)] lg:[grid-row:var(--dr)]"
          style={
            {
              "--c": m[0] + 1,
              "--r": m[1],
              "--s": m[2],
              "--tc": t[0] + 1,
              "--tr": t[1],
              "--ts": t[2],
              "--dc": d[0] + 1,
              "--dr": d[1],
              "--ds": d[2],
              "--hero-word-index": index,
            } as CSSProperties
          }
        >
          <span className="font-owners-medium absolute top-0 left-0 p-(--v2-pad) text-[12px] tracking-wide uppercase md:text-[14px]">
            {word}
          </span>
        </div>
      ))}
      <p
        className="hero-word font-owners-narrow-bold col-[2/span_4] row-[3/span_2] flex items-center justify-center text-center text-[13vw] leading-[0.9] tracking-[-0.005em] uppercase md:col-[2/span_12] md:text-[min(8vw,calc(var(--s-cell-h)*1.1))] lg:col-[2/span_16]"
        style={beat(WORDS.length + 1)}
      >
        {SIGNATURE}
      </p>
    </LabSection>
  );
}

/**
 * C — one box per word, side by side on one row, the grid's lines between
 * them; stacked on a phone.
 */
const BOXES = [
  { word: "Brunch", d: [1, 3] },
  { word: "Lunch", d: [4, 3] },
  { word: "Catering", d: [7, 3] },
  { word: "Coffee cart", d: [10, 4] },
  { word: "Delivery", d: [14, 3] },
] as const;

export function HeroLabBoxes() {
  return (
    <LabSection label="C — Une case par mot" rows="[--rows:6] md:[--rows:5]">
      {BOXES.map(({ word, d }, index) => (
        <div
          key={word}
          data-grid-hole
          className="hero-word col-[2/span_4] flex items-center justify-center bg-cream [grid-row:var(--r)] md:row-[2/span_2] md:[grid-column:var(--dc)/span_var(--ds)] lg:[grid-column:var(--lc)/span_var(--ls)]"
          style={
            {
              "--r": index + 1,
              // Tablet has 12 cells: the desktop placement scaled to fit.
              "--dc": Math.round((d[0] * 12) / 16) + 1,
              "--ds": Math.max(2, Math.round((d[1] * 12) / 16)),
              "--lc": d[0] + 1,
              "--ls": d[1],
              "--hero-word-index": index,
            } as CSSProperties
          }
        >
          <span className="font-owners-narrow-bold text-[min(13vw,calc(var(--s-cell-h)*0.6))] leading-none tracking-[-0.005em] whitespace-nowrap uppercase md:text-[min(3.2vw,calc(var(--s-cell-h)*0.55))]">
            {word}
          </span>
        </div>
      ))}
      <p
        className="hero-word font-owners-medium col-[2/span_4] row-[6] flex items-center justify-center text-[13px] tracking-wide uppercase md:col-[2/span_12] md:row-[4] md:text-[15px] lg:col-[2/span_16]"
        style={beat(WORDS.length + 1)}
      >
        {SIGNATURE}
      </p>
    </LabSection>
  );
}
