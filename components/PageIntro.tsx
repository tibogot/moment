import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";

const SKY = "#a7c5ee";

type PageIntroProps = {
  title: string;
  lead?: string;
};

/** Shared header for the inner pages until each gets its own design. */
export function PageIntro({ title, lead }: PageIntroProps) {
  return (
    <GridSection className="pt-[22svh] pb-[12svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={SKY} animateOnScroll={false} delay={0.15}>
          <h1 className="font-owners-narrow-bold text-[11vw] leading-[0.9] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(8vw,12svh)]">
            {title}
          </h1>
        </TextReveal>
      </div>

      {lead && (
        <div className="col-start-2 col-end-5 mt-[5svh] px-(--grid-gutter) text-left md:col-start-5 md:col-end-8">
          <TextReveal blockColor={SKY} animateOnScroll={false} delay={0.35}>
            <p className="font-archivo-light text-[15px] leading-[1.5] wrap-break-word text-black md:text-[min(1.35vw,2svh)]">
              {lead}
            </p>
          </TextReveal>
        </div>
      )}
    </GridSection>
  );
}
