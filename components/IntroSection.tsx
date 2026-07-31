import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";

/** Matches --color-sky; TextReveal paints the block with an inline style. */
const SKY = "#a7c5ee";

export function IntroSection() {
  return (
    <GridSection className="py-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={SKY} stagger={0.12}>
          <h2 className="font-owners-narrow-bold text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(6vw,9svh)]">
            A traiteur in Brussels for people who care how it tastes — and how
            it looks.
          </h2>
        </TextReveal>
      </div>

      <div className="col-start-2 col-end-5 mt-[6svh] px-(--grid-gutter) text-left md:col-start-5 md:col-end-8 md:mt-[10svh]">
        <TextReveal blockColor={SKY} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light text-[15px] leading-[1.5] wrap-break-word text-black md:text-[min(1.35vw,2svh)]">
            We cook for private hosts and companies across the city. Seasonal
            plates, salads and cold-pressed juices, prepared each morning and
            delivered ready to serve. We run events end to end, and keep a
            coffee desk open for anyone passing by.
          </p>
        </TextReveal>
      </div>
    </GridSection>
  );
}
