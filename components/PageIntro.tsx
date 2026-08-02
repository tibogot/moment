import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  title: string;
  lead?: string;
  leadClassName?: string;
};

/** Shared header for the inner pages until each gets its own design. */
export function PageIntro({ title, lead, leadClassName }: PageIntroProps) {
  return (
    <GridSection className="pt-[22svh] pb-[12svh]">
      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} animateOnScroll={false} delay={0.15}>
          <h1 className="font-owners-narrow-bold max-w-full text-[11vw] leading-[0.9] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(8vw,12svh)]">
            {title}
          </h1>
        </TextReveal>
      </div>

      {lead && (
        <div className="col-start-2 col-end-5 mt-[5svh] min-w-0 px-(--grid-gutter) text-left md:col-start-5 md:col-end-8">
          <TextReveal blockColor={REVEAL_BLOCK} animateOnScroll={false} delay={0.35}>
            <p
              className={cn(
                "font-archivo-light max-w-full text-[15px] leading-[1.5] wrap-break-word text-black md:text-[min(1.35vw,2svh)]",
                leadClassName,
              )}
            >
              {lead}
            </p>
          </TextReveal>
        </div>
      )}
    </GridSection>
  );
}
