import Image from "next/image";
import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { GRID_COLUMNS, GRID_COLUMNS_MOBILE, type GridHole } from "@/lib/grid";
import { REVEAL_BLOCK } from "@/lib/colors";
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
  "font-archivo-light text-[11px] transition-opacity hover:opacity-60 md:text-[12px]";

export function Footer() {
  return (
    <footer className="relative h-[90svh] w-full overflow-hidden border-t border-sky bg-cream text-black md:h-[80svh]">
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
        className="absolute inset-0 grid"
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
          <Link href={routes.home} className="flex w-full justify-center">
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

        {/* Headline — open across the left; the rest of the field stays squared.
            text-left: TextReveal centres each split line unless an ancestor opts out. */}
        <div className="col-start-2 col-end-5 row-start-3 row-end-5 min-w-0 self-end pb-5 pl-(--grid-gutter) text-left md:col-end-6 md:pb-[4svh]">
          <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
            <p className="font-owners-narrow-bold max-w-full text-[13vw] leading-[0.88] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(7vw,12svh)]">
              Un moment,
              <br />
              simplement.
            </p>
          </TextReveal>
        </div>

        {/* Copyright + Belgian legal links in the bottom band. */}
        <div className="col-start-2 col-end-5 row-start-5 row-end-6 flex flex-col justify-center gap-3 px-(--grid-gutter) md:col-end-9 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="font-archivo-light shrink-0 text-[11px] md:text-[12px]">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end">
            <li>
              <CookiePreferencesButton className={legalLinkClassName} />
            </li>
            {legalNav.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={legalLinkClassName}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
