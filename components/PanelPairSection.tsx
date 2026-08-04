import Link from "next/link";
import { GridLines } from "@/components/GridLines";
import { ParallaxImage } from "@/components/ParallaxImage";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Each half carries its own 3 x 3 grid, so the two panels are ruled
 * identically. The cells are square, which makes a panel square too.
 */
const PANEL_COLUMNS = 3;
const PANEL_ROWS = 3;

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

/**
 * The title sits in the first two cells of the last row: the vertical rule
 * between them is dropped so the type has one open, two-cell-wide block.
 */
const TITLE_COLUMNS = 2;

const panels = [
  {
    title: "Events",
    href: routes.events,
    src: "/images/onur-kaya.jpg",
  },
  {
    title: "Coffee desk",
    href: routes.coffee,
    src: "/images/oak-bond-coffee.jpg",
  },
] as const;

/**
 * The ruled overlay: interior lines plus the block's own top and bottom rules,
 * drawn in cream so they read as the page grid continuing across the photo.
 */
function PanelGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
      aria-hidden
    >
      {Array.from({ length: PANEL_COLUMNS * PANEL_ROWS }).map((_, index) => {
        const column = index % PANEL_COLUMNS;
        const row = Math.floor(index / PANEL_COLUMNS);
        const inTitleBlock = row === PANEL_ROWS - 1 && column < TITLE_COLUMNS;

        return (
          <div
            key={index}
            className={cn(
              "border-t border-cream/60",
              row === PANEL_ROWS - 1 && "border-b",
              // Skip the rule that would otherwise split the title in two.
              column > 0 && !inTitleBlock && "border-l",
            )}
          />
        );
      })}
    </div>
  );
}

/**
 * Two square photographs side by side, each ruled 3 x 3 with its title lying
 * in the cleared pair of cells at the bottom left.
 */
export function PanelPairSection({ className }: { className?: string }) {
  return (
    <section className={cn("relative w-full bg-cream pb-[12svh]", className)}>
      {/* Sky spines for the breathing room below the panels, where there is no
          photograph for the cream ones to read against. Drawn first, so the
          images paint over them across the panels themselves. */}
      <GridLines lineClassName="bg-sky" />

      {/* Wraps the panels alone, so the cream spines inside it stop where the
          photographs do rather than running on through the gap. */}
      <div className="relative">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: MARGIN_COLUMNS }}
        >
          <div className="col-start-2 grid grid-cols-1 md:grid-cols-2">
            {panels.map((panel, index) => (
              <Link
                key={panel.title}
                href={panel.href}
                className={cn(
                  "group relative block aspect-square overflow-hidden",
                  // Stacked on mobile, so the seam between the two panels turns
                  // from a vertical rule into a horizontal one.
                  index > 0 &&
                    "border-t border-cream/60 md:border-t-0 md:border-l",
                )}
              >
                <ParallaxImage
                  src={panel.src}
                  alt=""
                  sizes="(max-width: 48rem) 100vw, 50vw"
                  className="absolute inset-0"
                />

                <PanelGrid />

                {/* Sized off the grid rather than placed in it: an explicitly
                    placed item would push the auto-flowed cells out of the way
                    and break the rules it is supposed to sit inside. */}
                <div
                  className="absolute bottom-0 left-0 flex items-end pb-(--grid-gutter) pl-(--grid-gutter)"
                  style={{
                    width: `${(TITLE_COLUMNS / PANEL_COLUMNS) * 100}%`,
                    height: `${100 / PANEL_ROWS}%`,
                  }}
                >
                  {/* Sized so the two lines of "Coffee desk" still clear the
                      rule above the row. */}
                  <h3 className="font-owners-narrow-bold text-cream text-[13vw] leading-[0.9] uppercase md:text-[min(5.6vw,10svh)]">
                    {panel.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Drawn after the photographs so the two page spines carry over them,
            the same way the full-bleed image section keeps them visible. */}
        <GridLines lineClassName="bg-cream/60" />
      </div>
    </section>
  );
}
