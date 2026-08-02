import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";

/**
 * The statement that opens the about page — same shape as the home page's
 * IntroSection (long sky rule, headline left, body set down and to the right),
 * but carrying the copy the page needs to rank for: traiteur, catering,
 * Brussels, the three things we actually sell.
 */
export function AboutIntro() {
  return (
    <GridSection className="pt-[10svh] pb-[14svh]">
      {/* Long sky rule setting the section off from the hero. */}
      <div className="col-span-full mb-[6svh] h-px bg-sky" />

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <h2 className="font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(6vw,9svh)]">
            We cook for whoever has to feed the room.
          </h2>
        </TextReveal>
      </div>

      <div className="col-start-2 col-end-5 mt-[6svh] min-w-0 px-(--grid-gutter) text-left md:col-start-5 md:col-end-8 md:mt-[10svh]">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light max-w-full text-[18px] leading-normal wrap-break-word text-black md:text-[min(1.35vw,2svh)]">
            Moment is a traiteur and catering kitchen in Brussels. Every
            morning we cook seasonal plates, salads, pastries and cold-pressed
            juices, then send them out across the city — to offices in the
            European quarter, to studios in Saint-Gilles, to kitchen tables in
            between.
          </p>

          <p className="font-archivo-light mt-5 max-w-full text-[18px] leading-normal wrap-break-word text-black md:mt-[3svh] md:text-[min(1.35vw,2svh)]">
            Some weeks that is forty lunches before ten in the morning. Some
            weeks it is a seated dinner for thirty, a launch for two hundred,
            or a coffee desk open until the room empties. The logistics change.
            The kitchen behind them does not.
          </p>
        </TextReveal>
      </div>
    </GridSection>
  );
}
