import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

type NotFoundGridProps = {
  copy: Dictionary["common"]["notFound"];
};

/**
 * The 404 on the v2 grid, after Rond Carré's brand card and book pages: the
 * number in the middle with the cells running round it, and the ( m )
 * monogram in the bottom band. Cream page and sky rules like every page; the
 * palette preview turns it into the card (sky page, cream rules).
 *
 * The number is centred on the field rather than placed in cells: the hero's
 * row count changes with the screen, so "the middle cells" have no fixed
 * address. Both blocks are marked `data-grid-hole`, so CellGrid clears
 * exactly the cells they cover — however many rows the screen gives.
 */
export function NotFoundGrid({ copy }: NotFoundGridProps) {
  return (
    <section className="relative h-svh w-full overflow-hidden bg-cream text-black">
      <CellGrid lineClassName="bg-sky" readout={false} />

      {/* The number, alone in the middle of the field so the cells run all
          the way round it. Sized to about one row high (svh) and capped by
          the cell width, so it covers the middle cells and no more. */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: "var(--grid-margin)",
          right: "var(--grid-margin)",
          top: "var(--grid-band)",
          bottom: "var(--grid-band)",
        }}
      >
        <h1
          data-grid-hole
          className="font-owners-narrow-bold leading-[0.74] tracking-[-0.01em] text-[min(calc(var(--v2-col)*1.5),22svh)] md:text-[min(calc(var(--v2-col)*1.9),26svh)]"
        >
          <span aria-hidden>404</span>
          <span className="sr-only">{copy.title}</span>
        </h1>
      </div>

      {/* What happened and the way back, bottom-left in the last row — where
          the type sits in the v1 hero — so it never crowds the number. */}
      <div
        data-grid-hole
        className="absolute flex flex-col items-start px-(--grid-gutter) text-left lg:max-w-[calc(var(--v2-col)*2)]"
        style={{
          left: "var(--grid-margin)",
          right: "var(--grid-margin)",
          bottom: "var(--grid-band)",
          paddingBottom: "var(--grid-gutter)",
        }}
      >
        <p className="font-owners-medium text-[11px] tracking-wide uppercase md:text-[12px]">
          {copy.eyebrow}
        </p>
        <p className="font-archivo-light mt-3 max-w-[34ch] text-(length:--body-text) leading-normal">
          {copy.lead}
        </p>
        <Link href={routes.home} className="group mt-5 inline-flex">
          {/* The site's own button: sky fill and rule, cream on hover. */}
          <span className="border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 group-hover:bg-cream">
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
              {copy.back}
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </span>
        </Link>
      </div>

      {/* ( m ) bottom-right in the band, as on the brand-book pages. */}
      <div
        className="absolute bottom-0 flex items-center"
        style={{
          height: "var(--grid-band)",
          right: "calc(var(--grid-margin) + var(--grid-gutter))",
        }}
      >
        <Image
          src="/brand/Moment-monogram.svg"
          alt=""
          width={1665}
          height={662}
          className="h-auto w-[clamp(64px,7vw,120px)]"
        />
      </div>
    </section>
  );
}
