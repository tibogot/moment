import { GRID_COLUMNS, GRID_ROWS, type GridHole } from "@/lib/grid";
import { cn } from "@/lib/utils";

type GridLinesProps = {
  /**
   * Also draw the interior column lines and the horizontal rules. Without it
   * only the two outer column lines are drawn — the ones that run uninterrupted
   * down every section of the page.
   */
  ruled?: boolean;
  columns?: number;
  rows?: number;
  /** Cells whose interior rules are dropped so they don't cross the type. */
  holes?: GridHole[];
  className?: string;
  /** Utility class for the rules themselves, e.g. `bg-sky`. */
  lineClassName?: string;
};

const track = (offset: string, index: number, total: number) =>
  `calc(${offset} + (100% - 2 * ${offset}) * ${index} / ${total})`;

const x = (index: number, columns: number) =>
  track("var(--grid-margin)", index, columns);

const y = (index: number, rows: number) =>
  track("var(--grid-band)", index, rows);

export function GridLines({
  ruled = false,
  columns = GRID_COLUMNS,
  rows = GRID_ROWS,
  holes = [],
  className,
  lineClassName = "bg-cream/60",
}: GridLinesProps) {
  /** Is column line `boundary` inside a hole as it crosses design row `row`? */
  const columnHidden = (boundary: number, row: number) =>
    holes.some(
      (hole) =>
        hole.col[0] <= boundary &&
        boundary + 1 <= hole.col[1] &&
        hole.row[0] <= row &&
        row <= hole.row[1],
    );

  /** Is rule `rule` inside a hole as it crosses design column `column`? */
  const ruleHidden = (rule: number, column: number) =>
    holes.some(
      (hole) =>
        hole.row[0] <= rule &&
        rule + 1 <= hole.row[1] &&
        hole.col[0] <= column &&
        column <= hole.col[1],
    );

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden
    >
      {[0, columns].map((boundary) => (
        <span
          key={`edge-${boundary}`}
          className={cn("absolute inset-y-0 w-px", lineClassName)}
          style={{ left: x(boundary, columns) }}
        />
      ))}

      {ruled && (
        <>
          {/* Interior columns are drawn a row at a time: they stop at the
              bands, and skip any row that would cross type. */}
          {Array.from({ length: columns - 1 }, (_, index) => index + 1).flatMap(
            (boundary) =>
              Array.from({ length: rows }, (_, index) => index + 1)
                .filter((row) => !columnHidden(boundary, row))
                .map((row) => (
                  <span
                    key={`column-${boundary}-${row}`}
                    className={cn("absolute w-px", lineClassName)}
                    style={{
                      left: x(boundary, columns),
                      top: y(row - 1, rows),
                      bottom: y(rows - row, rows),
                    }}
                  />
                )),
          )}

          {/* The top and bottom rules run full bleed; the interior ones stop at
              the edges of the grid. */}
          {[0, rows].map((rule) => (
            <span
              key={`bleed-${rule}`}
              className={cn("absolute inset-x-0 h-px", lineClassName)}
              style={{ top: y(rule, rows) }}
            />
          ))}

          {Array.from({ length: rows - 1 }, (_, index) => index + 1).flatMap(
            (rule) =>
              Array.from({ length: columns }, (_, index) => index + 1)
                .filter((column) => !ruleHidden(rule, column))
                .map((column) => (
                  <span
                    key={`rule-${rule}-${column}`}
                    className={cn("absolute h-px", lineClassName)}
                    style={{
                      top: y(rule, rows),
                      left: x(column - 1, columns),
                      right: x(columns - column, columns),
                    }}
                  />
                )),
          )}
        </>
      )}
    </div>
  );
}
