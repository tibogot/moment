import { CellGrid } from "@/components/v2/CellGrid";
import type { Locale } from "@/lib/i18n/config";
import { pick } from "@/lib/sanity/locale";
import type { TestimonialContent } from "@/lib/sanity/queries";

type TestimonialCellsProps = {
  testimonials: TestimonialContent[];
  locale: Locale;
  label: string;
};

/**
 * Customer reviews on the 16 / 12 / 4 grid — a first version, to be
 * redesigned (26 November 2026). Written from the Studio ("Avis clients").
 *
 * Renders nothing without a review: an empty "Ils nous font confiance" is
 * worse than no section.
 *
 *   desktop  label cells 1–16; three quotes, cells 1–5, 6–10, 11–15
 *   tablet   two quotes, cells 1–6 and 7–12
 *   phone    one under the other, across the 4 cells
 *
 * The frame only (no drawn cells), like the intro; text a cell's padding in.
 */
export function TestimonialCells({
  testimonials,
  locale,
  label,
}: TestimonialCellsProps) {
  const shown = testimonials.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section
      aria-labelledby="testimonials-title"
      className="relative w-full bg-cream"
    >
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        cells={false}
        readout={false}
        subdivide={2}
      />
      <div
        className="relative grid gap-y-[calc(var(--s-cell-h)/2)] py-[calc(var(--s-cell-h)/2)]"
        style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
      >
        <h2
          id="testimonials-title"
          className="font-owners-medium col-[2/span_4] px-(--v2-pad) text-[12px] tracking-wide uppercase md:col-[2/span_12] lg:col-[2/span_16]"
        >
          {label}
        </h2>

        <ul className="col-[2/span_4] grid gap-y-[6svh] md:col-[2/span_12] md:grid-cols-12 lg:col-[2/span_16] lg:grid-cols-16">
          {shown.map((testimonial, index) => (
            <li
              key={testimonial._id}
              className={
                index === 0
                  ? "min-w-0 px-(--v2-pad) md:col-[1/span_6] lg:col-[1/span_5]"
                  : index === 1
                    ? "min-w-0 px-(--v2-pad) md:col-[7/span_6] lg:col-[6/span_5]"
                    : "min-w-0 px-(--v2-pad) md:hidden lg:col-[11/span_5] lg:block"
              }
            >
              <figure>
                <blockquote className="font-archivo-light text-(length:--body-text) leading-normal text-pretty">
                  « {pick(testimonial.quote, locale)?.trim()} »
                </blockquote>
                <figcaption className="mt-4">
                  <span className="font-owners-medium block text-[12px] tracking-wide uppercase">
                    {testimonial.name}
                  </span>
                  {testimonial.company && (
                    <span className="font-archivo-light mt-1 block text-[13px] opacity-70">
                      {testimonial.company}
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
