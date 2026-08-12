import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridLines } from "@/components/GridLines";
import { ParallaxImage } from "@/components/ParallaxImage";
import { routes } from "@/lib/routes";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

/**
 * Each half carries its own 3 x 3 grid, so the two panels are ruled
 * identically. Panels are portrait (taller than wide) so the cells read
 * as rectangles rather than squares — gently so on desktop, where a panel is
 * half the page wide and every point of ratio is worth ~100px of height.
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
  { key: "events", href: routes.events, src: "/images/onur-kaya.jpg" },
  { key: "coffee", href: routes.coffee, src: "/images/oak-bond-coffee.jpg" },
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
 * Two portrait photographs side by side, each ruled 3 x 3 with its title lying
 * in the cleared pair of cells at the bottom left.
 */
type PanelKey = (typeof panels)[number]["key"];

type PanelCopy = {
  title: string;
  lead: string;
};

type PanelPairSectionProps = {
  /** Panel labels, keyed to match `panels` below. */
  copy: Record<PanelKey, PanelCopy>;
  /**
   * Photographs from the Studio, keyed the same way. Either may be absent —
   * an owner who has replaced one and not the other should see exactly that,
   * not a broken panel.
   */
  images?: Partial<Record<PanelKey, SanityImage | null>>;
  className?: string;
};

export function PanelPairSection({
  copy,
  images,
  className,
}: PanelPairSectionProps) {
  // Falls back to the photograph shipped with the site. The panels are half the
  // viewport wide, so 1600 is generous even on a large screen.
  const sourceFor = (key: PanelKey, fallback: string) => {
    const image = images?.[key];
    return image ? urlFor(image).width(1600).auto("format").url() : fallback;
  };

  return (
    <section className={cn("relative w-full bg-cream pb-[12svh]", className)}>
      {/* Same sky spines as every other cream section. */}
      <GridLines lineClassName="bg-sky" />

      <div className="relative">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: MARGIN_COLUMNS }}
        >
          {/* Inset from the spines with the page gutter — panels sit closer as
              a pair and shrink a touch (aspect ratio follows width). */}
          <div className="col-start-2 grid grid-cols-1 gap-(--grid-gutter) px-(--grid-gutter) md:grid-cols-2">
            {panels.map((panel) => (
              <Link
                key={panel.key}
                href={panel.href}
                className="group relative block aspect-3/4 overflow-hidden md:aspect-6/7"
              >
                <ParallaxImage
                  src={sourceFor(panel.key, panel.src)}
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
                  {/* Sized to the longest label in any of the three
                      languages, which is the Dutch "Evenementen".
                      
                      The box holds two lines and "Comptoir café" uses both,
                      but a single long word cannot wrap into them — at the
                      original 13vw / 5.6vw it ran 60px past the cell on a
                      390px phone and 82px on a desktop. Measured, the widest
                      label needs 9.9vw and 4.6vw at the sizes it is set in;
                      these sit just under, because a value measured to the
                      pixel still overflowed by one — fonts do not land on
                      exactly the same width twice. English "Events" is the same size as the rest by
                      choice: one type size across the three languages reads
                      as a decision, three sizes read as an accident.

                      h2, not h3: these are two of the rooms of the business,
                      peers of "What we do" and "Why us" further down, and
                      there is no h2 in this section for an h3 to belong to. */}
                  <div>
                    <h2 className="font-owners-narrow-bold text-cream text-[9.4vw] leading-[0.9] uppercase md:text-[min(4.4vw,7.6svh)]">
                      {copy[panel.key].title}
                    </h2>
                    <p className="font-archivo-light mt-2 text-[20px] leading-snug text-cream md:text-[22px]">
                      {copy[panel.key].lead}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
