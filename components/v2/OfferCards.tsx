import type { StaticImageData } from "next/image";
import { CdnImage as Image } from "@/components/CdnImage";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import { cn } from "@/lib/utils";

type OfferCard = {
  title: string;
  body: string;
  href: string;
  /** A URL from the Studio, or a bundled photograph. */
  image: string | StaticImageData;
};

type OfferCardsProps = {
  title: string;
  cards: OfferCard[];
};

/**
 * The home's three services under the moments carousel (25 November 2026):
 * events, companies, the coffee desk — the brief's "particuliers comme
 * entreprises, un déjeuner livré au bureau comme un service traiteur
 * complet". Where grapeandfig.com sets its breakfast / lunch / evening, Moment
 * sets what is not a product: the services.
 *
 * On the 16 / 12 / 4 grid. 16 does not divide by 3, so on desktop the title
 * takes the first 4 cells and the three cards the other 12, 4 each; on a
 * tablet the title takes the first row and the cards 4 cells each; on a
 * phone they stack, 4 cells wide. A card is a 4 × 4 photograph — a 3/4
 * block — and one row for its title and line.
 *
 * Desktop rows: 5 (photograph 4, text 1). Tablet: 1 (title) + 5. Phone: 1 +
 * 3 × 5.
 */
export function OfferCards({ title, cards }: OfferCardsProps) {
  const PLACE = [
    "row-[2/span_5] md:col-[2/span_4] md:row-[2/span_5] lg:col-[6/span_4] lg:row-[1/span_5]",
    "row-[7/span_5] md:col-[6/span_4] md:row-[2/span_5] lg:col-[10/span_4] lg:row-[1/span_5]",
    "row-[12/span_5] md:col-[10/span_4] md:row-[2/span_5] lg:col-[14/span_4] lg:row-[1/span_5]",
  ];

  return (
    // The bottom border closes the last row. Pulled up by a rule and raised a
    // layer: a section after it that opens on a rule draws that rule on the
    // same pixels (no double line); one that opens on a band (the footer)
    // leaves it showing. The section after may open on
    // a band (the footer), not a rule.
    <section className="relative z-1 -mb-(--grid-line) w-full border-b border-sky bg-cream">
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        readout={false}
        subdivide={2}
        linesOnTop
      />
      <div
        className="relative grid [--rows:16] md:[--rows:6] lg:[--rows:5]"
        style={{
          gridTemplateColumns: "var(--s-grid-columns)",
          gridTemplateRows: "repeat(var(--rows), var(--s-cell-h))",
        }}
      >
        <div
          data-grid-hole
          className="col-[2/span_4] row-[1] flex items-end p-(--v2-pad) md:col-[2/span_12] lg:col-[2/span_4] lg:row-[1/span_5] lg:items-start"
        >
          <h2 className="font-owners-narrow-bold text-[9vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[length:calc(var(--s-cell-w)*0.55)]">
            {title}
          </h2>
        </div>

        {cards.slice(0, 3).map((card, index) => (
          <Link
            key={card.href}
            href={card.href}
            className={cn(
              "collection-card group col-[2/span_4] grid min-w-0 grid-rows-[4fr_1fr] transition-colors duration-500",
              PLACE[index],
            )}
          >
            {/* The photograph and the text are a block each: the grid's own
                rule runs between them, and around them. The photograph is
                4 × 4 cells, edge to edge — the rules are drawn over it. */}
            <div data-grid-hole className="relative overflow-hidden">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            {/* Its title and line: one row. */}
            <div
              data-grid-hole
              className="flex min-w-0 flex-col justify-between p-(--v2-pad)"
            >
              <h3 className="font-owners-narrow-bold flex items-center justify-between gap-3 text-[length:max(20px,calc(var(--s-cell-h)*0.22))] leading-[0.95] uppercase">
                {card.title}
                <span
                  aria-hidden
                  className="font-owners-medium text-[14px] transition-transform duration-500 group-hover:translate-x-1.5"
                >
                  &rarr;
                </span>
              </h3>
              <p className="font-archivo-light text-[15px] leading-snug">
                {card.body}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
