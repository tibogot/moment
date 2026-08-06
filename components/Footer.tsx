"use client";

import Image from "next/image";
import { Lines } from "@/components/Lines";
import { useDictionary } from "@/components/LocaleProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { FooterGridCells } from "@/components/FooterGridCells";
import { GridLines } from "@/components/GridLines";
import { GRID_COLUMNS, GRID_COLUMNS_MOBILE, type GridHole } from "@/lib/grid";
import { legalNav, routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

/**
 * Same system as the hero: a full ruled field, with a hole only where the
 * headline sits so the sky squares stay intact everywhere else.
 */
const holes: GridHole[] = [
  { col: [1, 4], row: [2, 3] }, // headline
];

const mobileHoles: GridHole[] = [
  { col: [1, 3], row: [2, 3] }, // headline
];

const legalLinkClassName =
  "font-archivo-light text-[11px] leading-snug transition-opacity hover:opacity-60 md:text-[12px]";

export function Footer() {
  const dict = useDictionary();

  return (
    <footer className="site-footer relative h-[90svh] w-full overflow-hidden bg-cream text-black md:h-[80svh]">
      <FooterGridCells
        columns={GRID_COLUMNS_MOBILE}
        holes={mobileHoles}
        className="md:hidden"
      />
      <FooterGridCells
        columns={GRID_COLUMNS}
        holes={holes}
        className="hidden md:grid"
      />

      <GridLines
        ruled
        columns={GRID_COLUMNS_MOBILE}
        holes={mobileHoles}
        lineClassName="bg-sky"
        className="md:hidden"
      />
      <GridLines
        ruled
        columns={GRID_COLUMNS}
        holes={holes}
        lineClassName="bg-sky"
        className="hidden md:block"
      />

      <div
        className="pointer-events-none absolute inset-0 z-10 grid"
        style={{
          gridTemplateColumns: "var(--grid-columns)",
          gridTemplateRows: "var(--grid-rows)",
        }}
      >
        {/* Logo sits inside the first cell of the ruled field — the square
            directly above the headline — so the box frames it. Sized as a
            share of the cell rather than in px, since the cell is a column
            wide and that changes with the viewport. */}
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center justify-center">
          <Link
            href={routes.home}
            className="pointer-events-auto flex w-full justify-center"
          >
            <Image
              src="/brand/logonav.svg"
              alt={siteConfig.name}
              width={155}
              height={29}
              className="h-auto w-[62%] max-w-30"
              style={{ filter: "brightness(0)" }}
            />
          </Link>
        </div>

        {/* Headline — open across the left; the rest of the field stays squared. */}
        <div className="col-start-2 col-end-5 row-start-3 row-end-5 min-w-0 self-end pb-5 pl-(--grid-gutter) text-left md:col-end-6 md:pb-[4svh]">
          <p className="font-owners-narrow-bold max-w-full text-[13vw] leading-[0.88] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(7vw,12svh)]">
            <Lines text={dict.footer.headline} />
          </p>
        </div>

        {/* Copyright + Belgian legal links in the bottom band. */}
        <div className="col-start-2 col-end-5 row-start-5 row-end-6 flex flex-col justify-center gap-2.5 px-(--grid-gutter) md:col-end-9 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="font-archivo-light shrink-0 text-[11px] leading-snug md:text-[12px]">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 md:justify-end md:gap-x-4 md:gap-y-2">
            <li>
              <CookiePreferencesButton
                className={`pointer-events-auto ${legalLinkClassName}`}
              />
            </li>
            {legalNav.map(({ key, href }) => (
              <li key={href}>
                <Link href={href} className={`pointer-events-auto ${legalLinkClassName}`}>
                  {dict.legalNav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
