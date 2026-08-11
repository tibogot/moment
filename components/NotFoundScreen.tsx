import { LocaleLink as Link } from "@/components/LocaleLink";
import { Footer } from "@/components/Footer";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { GRID_COLUMNS, GRID_COLUMNS_MOBILE, type GridHole } from "@/lib/grid";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

/**
 * The 404 screen, shared by the root boundary and the per-language one.
 *
 * Takes its copy as a prop rather than reading context, because the boundary
 * that renders it has none. `app/[lang]/not-found.tsx` used to exist and never
 * rendered: at the root-layout level it *is* the global `/_not-found` route, so
 * Next builds it outside the LocaleProvider — silently falling back to its own
 * default 404 before, and throwing once it started reading the dictionary.
 *
 * So there is one 404, at `app/not-found.tsx`, in the default language. Deeper
 * boundaries — `news/[slug]/not-found.tsx` — do render inside the provider and
 * keep their own language.
 *
 * Same field as the hero and the footer: a full ruled grid on cream. The middle
 * row is cleared end to end so the numerals sit in an empty band with an intact
 * rule above and below them.
 */
const holes: GridHole[] = [
  { col: [1, 7], row: [2, 2] }, // 404
  { col: [1, 2], row: [1, 1] }, // eyebrow
  { col: [1, 3], row: [3, 3] }, // lead
  { col: [6, 7], row: [3, 3] }, // back-home button
];

const mobileHoles: GridHole[] = [
  { col: [1, 3], row: [2, 2] },
  { col: [1, 2], row: [1, 1] },
  { col: [1, 3], row: [3, 3] },
];

export function NotFoundScreen({
  copy,
}: {
  copy: Dictionary["common"]["notFound"];
}) {
  const t = copy;

  return (
    <>
      <section className="relative h-svh w-full overflow-hidden bg-cream text-black">
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
          {/* Eyebrow sits in the first ruled row, under the fixed navbar. */}
          <div className="col-start-2 col-end-5 row-start-2 row-end-3 self-end px-(--grid-gutter) pb-4 md:col-end-4">
            <p className="font-owners-medium text-[11px] tracking-wide uppercase md:text-[12px]">
              {t.eyebrow}
            </p>
          </div>

          {/* text-center is required: TextReveal centres each split line, and
              the wrapper only follows an explicit alignment on an ancestor. */}
          <div className="col-start-2 col-end-5 row-start-3 row-end-4 flex min-w-0 items-center justify-center px-(--grid-gutter) text-center md:col-end-9">
            <TextReveal
              animateOnScroll={false}
              blockColor={REVEAL_BLOCK}
              delay={0.2}
            >
              <h1 className="font-owners-narrow-bold max-w-full text-[42vw] leading-[0.8] tracking-[-0.01em] md:text-[min(28vw,30svh)]">
                404
              </h1>
            </TextReveal>
          </div>

          {/* Lead on the left, the way out on the right — the hero's split. */}
          <div className="col-start-2 col-end-5 row-start-4 row-end-5 flex min-w-0 flex-col gap-6 px-(--grid-gutter) pt-[4svh] text-left md:col-end-9 md:flex-row md:items-start md:justify-between md:gap-8">
            <TextReveal
              animateOnScroll={false}
              blockColor={REVEAL_BLOCK}
              delay={0.45}
              stagger={0.08}
              duration={0.6}
            >
              <p className="font-archivo-light max-w-[34ch] text-(length:--body-text) leading-normal wrap-break-word">
                {t.lead}
              </p>
            </TextReveal>

            <Link href={routes.home} className="group inline-flex shrink-0">
              <span className="border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 group-hover:bg-cream">
                <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
                  {t.back}
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
        </div>
      </section>

      <Footer />
    </>
  );
}
