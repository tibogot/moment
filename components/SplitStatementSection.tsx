import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

export type SplitStatementCopy = {
  headline: string;
  body: readonly [string, string] | string[];
};

type SplitStatementSectionProps = {
  copy: SplitStatementCopy;
  className?: string;
  /** Drop the top sky rule when the section already sits under another rule. */
  showRule?: boolean;
  /**
   * `lg` — about intro / hero-scale statement.
   * `md` — same size as AboutStatement on the about page.
   */
  headlineSize?: "lg" | "md";
};

/**
 * Indented, centered headline with two body paragraphs split left / right on
 * the page grid — shared by the about intro and the home beat before collections.
 */
export function SplitStatementSection({
  copy,
  className,
  showRule = true,
  headlineSize = "lg",
}: SplitStatementSectionProps) {
  const [left, right] = copy.body;

  return (
    <GridSection className={cn("pt-[10svh] pb-[14svh]", className)}>
      {showRule && <div className="col-span-full mb-[6svh] h-(--grid-line) bg-sky" />}

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-start-3 md:col-end-9">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <h2
            className={cn(
              "indent-first-line intro-headline font-owners-narrow-bold leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase",
              headlineSize === "md"
                ? "max-w-full text-[7.5vw] md:text-[min(5vw,7.5svh)]"
                : "max-w-full text-[8vw] md:text-[min(6vw,9svh)]",
            )}
          >
            {copy.headline}
          </h2>
        </TextReveal>
      </div>

      <div className="col-start-2 col-end-5 mt-[6svh] min-w-0 px-(--grid-gutter) text-left md:col-start-3 md:col-end-6 md:mt-[10svh]">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light max-w-[42ch] text-(length:--body-text) leading-normal wrap-break-word text-black">
            {left}
          </p>
        </TextReveal>
      </div>

      <div
        className={cn(
          "col-start-2 col-end-5 mt-5 min-w-0 px-(--grid-gutter) text-left",
          "md:col-start-6 md:col-end-9 md:mt-[10svh]",
        )}
      >
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light max-w-[42ch] text-(length:--body-text) leading-normal wrap-break-word text-black">
            {right}
          </p>
        </TextReveal>
      </div>
    </GridSection>
  );
}
