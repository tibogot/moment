import Image from "next/image";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { cn } from "@/lib/utils";
import { REVEAL_BLOCK, REVEAL_BLOCK_ON_SKY } from "@/lib/colors";

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

const THEMES = {
  cream: {
    section: "bg-cream",
    sticky: "bg-cream",
    line: "bg-sky",
    lineMuted: "bg-sky/45",
    border: "border-sky",
    reveal: REVEAL_BLOCK,
  },
  sky: {
    section: "bg-sky text-black",
    sticky: "bg-sky",
    line: "bg-cream",
    lineMuted: "bg-cream/45",
    border: "border-cream",
    reveal: REVEAL_BLOCK_ON_SKY,
  },
} as const;

type StickyTitleSectionTheme = keyof typeof THEMES;

/**
 * The halves are a straight 50/50, so the seam falls mid-column rather than on
 * a page column line. The rules inside the title half are still placed off the
 * page's 7 columns, so the grid behind the type stays the page's grid.
 */
const COLUMNS = 7;

/** Page column lines inside the title half, as a fraction of that half's width. */
function titleRules(imagePosition: "left" | "right") {
  if (imagePosition === "right") {
    return Array.from(
      { length: COLUMNS - 1 },
      (_, index) => ((index + 1) / COLUMNS) * 2,
    ).filter((fraction) => fraction < 1);
  }

  return Array.from({ length: COLUMNS - 1 }, (_, index) => (index + 1) / COLUMNS)
    .filter((fraction) => fraction > 0.5)
    .map((fraction) => (fraction - 0.5) * 2);
}

type StickyTitleSectionProps = {
  label: string;
  title: string;
  body?: string;
  src: string;
  alt?: string;
  className?: string;
  theme?: StickyTitleSectionTheme;
  /** Desktop layout — mobile always stacks image below the title. */
  imagePosition?: "left" | "right";
};

/**
 * One viewport tall, with the title held against the top while the photograph
 * scrolls past it. The section being exactly 100svh is what gives the sticky
 * block its travel — it releases when the section's bottom edge catches up.
 */
export function StickyTitleSection({
  label,
  title,
  body,
  src,
  alt = "",
  className,
  theme = "cream",
  imagePosition = "right",
}: StickyTitleSectionProps) {
  const palette = THEMES[theme];
  const rules = titleRules(imagePosition);

  const titlePanel = (
    <div className={cn("relative", imagePosition === "left" && "order-1 md:order-2")}>
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        aria-hidden
      >
        {rules.map((fraction) => (
          <span
            key={fraction}
            className={cn("absolute inset-y-0 w-(--grid-line)", palette.lineMuted)}
            style={{ left: `${fraction * 100}%` }}
          />
        ))}
      </div>

      <div
        className={cn(
          "relative px-(--grid-gutter) py-[6svh] text-left md:sticky md:top-(--grid-band)",
          palette.sticky,
        )}
      >
        <span className="font-owners-medium text-[12px] uppercase tracking-wide">
          {label}
        </span>

        <div
          className={cn("mt-4 mb-6 h-(--grid-line)", palette.line)}
          style={{
            marginInline: "calc(-1 * var(--grid-gutter))",
            width: "calc(100% + 2 * var(--grid-gutter))",
          }}
          aria-hidden
        />

        <TextReveal blockColor={palette.reveal} stagger={0.12}>
          <h2 className="font-owners-narrow-bold text-[11vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(4.4vw,7svh)]">
            {title}
          </h2>
        </TextReveal>

        {body && (
          <div className="mt-[4svh]">
            <TextReveal
              blockColor={palette.reveal}
              stagger={0.08}
              duration={0.6}
            >
              <p className="font-archivo-light max-w-full text-[18px] leading-normal md:max-w-[52ch]">
                {body}
              </p>
            </TextReveal>
          </div>
        )}
      </div>
    </div>
  );

  const imagePanel = (
    <div
      className={cn(
        "relative aspect-4/5 overflow-hidden md:aspect-auto md:h-full md:border-t-0",
        palette.border,
        "border-t",
        imagePosition === "left" ? "order-2 md:order-1 md:border-r" : "md:border-l",
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 45vw"
        className="object-cover"
      />
    </div>
  );

  return (
    <section
      className={cn(
        "relative w-full pb-[10svh] md:h-svh md:pb-0",
        palette.section,
        className,
      )}
    >
      <GridLines lineClassName={palette.line} />

      <div
        className="relative grid md:h-full"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="col-start-2 md:h-full">
          <div
            className={cn(
              "grid md:h-full md:grid-cols-2",
              palette.border,
              "border-y border-x",
            )}
          >
            {imagePosition === "left" ? (
              <>
                {imagePanel}
                {titlePanel}
              </>
            ) : (
              <>
                {titlePanel}
                {imagePanel}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
