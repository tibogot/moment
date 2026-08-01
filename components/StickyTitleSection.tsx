import Image from "next/image";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { cn } from "@/lib/utils";

/** Matches --color-sky; TextReveal paints the block with an inline style. */
const SKY = "#a7c5ee";

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

/**
 * The halves are a straight 50/50, so the seam falls mid-column rather than on
 * a page column line. The rules inside the title half are still placed off the
 * page's 7 columns, so the grid behind the type stays the page's grid.
 */
const COLUMNS = 7;

/** Page column lines that land inside the left half, as a fraction of it. */
const TITLE_RULES = Array.from(
  { length: COLUMNS - 1 },
  (_, index) => ((index + 1) / COLUMNS) * 2,
).filter((fraction) => fraction < 1);

type StickyTitleSectionProps = {
  label: string;
  title: string;
  src: string;
  alt?: string;
  className?: string;
};

/**
 * One viewport tall, with the title held against the top while the photograph
 * scrolls past it. The section being exactly 100svh is what gives the sticky
 * block its travel — it releases when the section's bottom edge catches up.
 */
export function StickyTitleSection({
  label,
  title,
  src,
  alt = "",
  className,
}: StickyTitleSectionProps) {
  return (
    <section className={cn("relative w-full bg-cream md:h-svh", className)}>
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid md:h-full"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="col-start-2 md:h-full">
          <div className="grid border-y border-sky md:h-full md:grid-cols-2">
            <div className="relative">
              {/* The bare cells behind the type. The sticky block below is
                  painted cream, so it wipes these as it travels down rather
                  than letting a rule run through the headline. */}
              <div
                className="pointer-events-none absolute inset-0 hidden md:block"
                aria-hidden
              >
                {TITLE_RULES.map((fraction) => (
                  <span
                    key={fraction}
                    className="absolute inset-y-0 w-px bg-sky/45"
                    style={{ left: `${fraction * 100}%` }}
                  />
                ))}
              </div>

              {/* text-left: TextReveal centres each split line unless an
                  ancestor opts out. */}
              <div className="relative bg-cream px-(--grid-gutter) py-[6svh] text-left md:sticky md:top-(--grid-band)">
                <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                  {label}
                </span>

                <div className="mt-4 mb-6 h-px bg-sky" aria-hidden />

                <TextReveal blockColor={SKY} stagger={0.12}>
                  <h2 className="font-owners-narrow-bold text-[11vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(4.4vw,7svh)]">
                    {title}
                  </h2>
                </TextReveal>
              </div>
            </div>

            <div className="relative aspect-4/5 overflow-hidden border-t border-sky md:aspect-auto md:h-full md:border-t-0 md:border-l">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
