import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

/**
 * The statement that opens the about page — same shape as the home page's
 * IntroSection (long sky rule, first-line indented headline), shifted one
 * column toward center, with the two body paragraphs split left / right on
 * the page grid. Carries the copy the page needs to rank for: traiteur,
 * catering, Brussels, the three things we actually sell.
 */
export function AboutIntro({ copy }: { copy: Dictionary["about"]["intro"] }) {
  const [left, right] = copy.body;

  return (
    <GridSection className="pt-[10svh] pb-[14svh]">
      {/* Long sky rule setting the section off from the hero. */}
      <div className="col-span-full mb-[6svh] h-px bg-sky" />

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-start-3 md:col-end-9">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <h2 className="indent-first-line intro-headline font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(6vw,9svh)]">
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
