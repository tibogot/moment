import type { ReactNode } from "react";
import { LocaleLink as Link } from "@/components/LocaleLink";
import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";

type IntroGridSectionProps = {
  copy: { headline: string; body: string };
  aboutLabel: string;
  /** More of the same section under the text — the two panels. */
  children?: ReactNode;
};

/**
 * v1's IntroSection on the v2 grid.
 *
 * Same bands as the hero — --grid-band top and bottom, the frame rules in
 * them — and the cells in between. Grid column 1 is the left margin, so cell
 * n is grid column n + 1. Every block is padded by --grid-gutter on the
 * sides, the same inset the navbar and v1 use, so type lines up with the nav
 * and with anything else padded the same way.
 *
 * Placed in cells across, not in rows down. The cells are not drawn here, so
 * nothing shows which row a block sits in — and pinning the body to a row
 * made the gap under the headline whatever the rows left over, different on
 * every screen. Instead both blocks sit in a subgrid that reuses the page's
 * columns exactly, and the body follows the headline at a fixed gap, as in
 * v1. Horizontally everything still starts and ends on a cell line.
 *
 * Columns, as cells (Shift + G shows them):
 *   mobile, 4    headline 1–4   body 2–4
 *   tablet, 6    headline 1–6   body 3–6
 *   desktop, 8   headline 1–7   body 5–8
 *
 * As in v1, the headline takes nearly the full width and the body sits under
 * it, pushed to the right edge of the grid.
 */
export function IntroGridSection({
  copy,
  aboutLabel,
  children,
}: IntroGridSectionProps) {
  return (
    <section className="relative w-full bg-cream">
      {/* Frame only: the cells place the type but are not drawn here. */}
      <CellGrid lineClassName="bg-sky" readout={false} cells={false} />

      <div
        className="relative grid"
        style={{
          gridTemplateColumns: "var(--v2-columns)",
          paddingBlock: "var(--grid-band)",
        }}
      >
        {/* Every cell column, as a subgrid: the blocks inside place by cell
            (column 1 = cell 1 here, no margin column) and stack by content. */}
        <div className="col-[2/span_4] grid grid-cols-subgrid gap-y-[7svh] pt-(--grid-gutter) pb-[7svh] md:col-[2/span_6] lg:col-[2/span_8]">
          <div
            data-grid-hole
            className="col-[1/span_4] min-w-0 px-(--grid-gutter) text-left [--v2-span:6] md:col-[1/span_6] lg:col-[1/span_7] lg:[--v2-span:7]"
          >
            <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
              {/* One cell of first-line indent from tablet up. Smaller than v1's
                intro headline (8vw / min(6vw, 9svh)) at the client's request. */}
              <h2 className="font-owners-narrow-bold indent-first-line v2-indent max-w-full text-[7vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(4.4vw,7svh)]">
                {copy.headline}
              </h2>
            </TextReveal>
          </div>

          <div
            data-grid-hole
            className="col-[2/span_3] min-w-0 px-(--grid-gutter) text-left md:col-[3/span_4] lg:col-[5/span_4]"
          >
            <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
              <p className="font-archivo-light max-w-full text-(length:--body-text) leading-normal wrap-break-word text-black">
                {copy.body}
              </p>

              <Link
                href={routes.about}
                className="group mt-5 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
              >
                <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                  {aboutLabel}
                  <span
                    className="transition-transform duration-500 group-hover:translate-x-1.5"
                    aria-hidden
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            </TextReveal>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
