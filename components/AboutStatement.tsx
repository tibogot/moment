import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";

type AboutStatementProps = {
  headline: string;
  className?: string;
};

/**
 * Large indented statement matching AboutIntro's headline — centered on the
 * page grid, first line pushed in one column on desktop.
 */
export function AboutStatement({ headline, className }: AboutStatementProps) {
  return (
    <GridSection className={className ?? "pt-[14svh] pb-[14svh]"}>
      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-start-3 md:col-end-9">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <h2 className="indent-first-line intro-headline font-owners-narrow-bold max-w-full text-[6.5vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(4vw,6svh)]">
            {headline}
          </h2>
        </TextReveal>
      </div>
    </GridSection>
  );
}
