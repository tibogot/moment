"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { Flip, gsap } from "@/lib/gsapConfig";
import { GRID_ROWS, type GridHole } from "@/lib/grid";
import { cn } from "@/lib/utils";

const DURATION = 0.55;
const EASE = "power3.inOut";

type FooterGridCellsProps = {
  columns: number;
  /** Merged hover regions — one target per hole instead of per cell. */
  holes?: GridHole[];
  className?: string;
};

function isInHole(col: number, row: number, holes: GridHole[]) {
  return holes.some(
    (hole) =>
      col >= hole.col[0] &&
      col <= hole.col[1] &&
      row >= hole.row[0] &&
      row <= hole.row[1],
  );
}

/** Design column (1-based) → CSS grid track (margin track is 1). */
const gridCol = (col: number) => col + 1;

/** Design row (1-based) → CSS grid track (top band is track 1). */
const gridRow = (row: number) => row + 1;

function findCellAtPoint(
  x: number,
  y: number,
  cells: HTMLElement[],
): HTMLElement | null {
  let match: HTMLElement | null = null;

  for (const cell of cells) {
    const rect = cell.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      match = cell;
    }
  }

  return match;
}

/**
 * One highlight morphs between grid cells on hover — same Flip handoff as the
 * services image frame, rather than each square cross-fading on its own.
 */
export function FooterGridCells({
  columns,
  holes = [],
  className,
}: FooterGridCellsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const activeCellRef = useRef<HTMLElement | null>(null);
  const placedRef = useRef(false);

  const positionHighlight = useCallback((cell: HTMLElement, animate: boolean) => {
    const container = containerRef.current;
    const highlight = highlightRef.current;
    if (!container || !highlight) return;

    gsap.killTweensOf(highlight);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const containerRect = container.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();

    const props = {
      left: cellRect.left - containerRect.left,
      top: cellRect.top - containerRect.top,
      width: cellRect.width,
      height: cellRect.height,
      opacity: 1,
    };

    if (animate && placedRef.current && !reduceMotion) {
      const state = Flip.getState(highlight);
      gsap.set(highlight, props);
      Flip.from(state, {
        duration: DURATION,
        ease: EASE,
        overwrite: "auto",
        onComplete: () => {
          gsap.set(highlight, { clearProps: "transform" });
        },
      });
    } else {
      gsap.set(highlight, { ...props, clearProps: "transform" });
      placedRef.current = true;
    }
  }, []);

  const activateCell = useCallback(
    (cell: HTMLElement) => {
      if (activeCellRef.current === cell) return;
      activeCellRef.current = cell;
      positionHighlight(cell, true);
    },
    [positionHighlight],
  );

  const deactivate = useCallback(() => {
    const highlight = highlightRef.current;
    if (!highlight || !activeCellRef.current) return;

    activeCellRef.current = null;
    placedRef.current = false;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.killTweensOf(highlight);
    gsap.to(highlight, {
      opacity: 0,
      duration: reduceMotion ? 0 : 0.35,
      ease: "power2.out",
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const footer = container?.closest("footer");
    if (!container || !footer) return;

    const onMove = (event: MouseEvent) => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      if (container.getBoundingClientRect().width === 0) return;

      const cells = Array.from(
        container.querySelectorAll<HTMLElement>(".footer-grid-cell"),
      );
      const cell = findCellAtPoint(event.clientX, event.clientY, cells);

      if (cell) {
        activateCell(cell);
      }
    };

    const onLeave = () => {
      deactivate();
    };

    footer.addEventListener("mousemove", onMove);
    footer.addEventListener("mouseleave", onLeave);

    return () => {
      footer.removeEventListener("mousemove", onMove);
      footer.removeEventListener("mouseleave", onLeave);
    };
  }, [activateCell, deactivate]);

  useEffect(() => {
    const onResize = () => {
      if (activeCellRef.current) {
        positionHighlight(activeCellRef.current, false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [positionHighlight]);

  const totalGridRows = GRID_ROWS + 2;
  const cells = [];

  const cellProps = (style: CSSProperties) => ({
    className: "footer-grid-cell",
    style,
  });

  for (let col = 1; col <= columns; col++) {
    cells.push(
      <div
        key={`band-top-${col}`}
        {...cellProps({ gridColumn: gridCol(col), gridRow: 1 })}
      />,
    );
  }

  for (let designRow = 1; designRow <= GRID_ROWS; designRow++) {
    for (let col = 1; col <= columns; col++) {
      if (isInHole(col, designRow, holes)) continue;

      cells.push(
        <div
          key={`${col}-${designRow}`}
          {...cellProps({
            gridColumn: gridCol(col),
            gridRow: gridRow(designRow),
          })}
        />,
      );
    }
  }

  for (let col = 1; col <= columns; col++) {
    cells.push(
      <div
        key={`band-bottom-${col}`}
        {...cellProps({
          gridColumn: gridCol(col),
          gridRow: totalGridRows,
        })}
      />,
    );
  }

  for (const hole of holes) {
    cells.push(
      <div
        key={`hole-${hole.col[0]}-${hole.row[0]}`}
        {...cellProps({
          gridColumn: `${gridCol(hole.col[0])} / ${gridCol(hole.col[1]) + 1}`,
          gridRow: `${gridRow(hole.row[0])} / ${gridRow(hole.row[1]) + 1}`,
        })}
      />,
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 grid", className)}
      style={{
        gridTemplateColumns: "var(--grid-columns)",
        gridTemplateRows: "var(--grid-rows)",
      }}
      aria-hidden
    >
      {cells}
      <div
        ref={highlightRef}
        className="footer-grid-highlight pointer-events-none absolute top-0 left-0 opacity-0 will-change-transform"
      />
    </div>
  );
}
