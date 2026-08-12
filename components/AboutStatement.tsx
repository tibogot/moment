import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

type AboutStatementProps = {
  headline: string;
  className?: string;
};

/**
 * Same indented headline block as SplitStatementSection at `headlineSize="md"`
 * — identical columns, gutter, rule, type size and max-width — so about and
 * home read as one system.
 */
export function AboutStatement({ headline, className }: AboutStatementProps) {
  return (
    <GridSection className={cn("pt-[10svh] pb-[14svh]", className)}>
      <div className="col-span-full mb-[6svh] h-px bg-sky" />

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-start-3 md:col-end-9">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <h2 className="indent-first-line intro-headline font-owners-narrow-bold max-w-full text-[7.5vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(5vw,7.5svh)]">
            {headline}
          </h2>
        </TextReveal>
      </div>
    </GridSection>
  );
}
