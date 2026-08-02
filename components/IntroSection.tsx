import Link from "next/link";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";

export function IntroSection() {
  return (
    <GridSection className="pt-[10svh] pb-[14svh]">
      {/* Long sky rule setting the section off from the hero. */}
      <div className="col-span-full mb-[6svh] h-px bg-sky" />
      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <h2 className="font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(6vw,9svh)]">
            A traiteur in Brussels for people who care how it tastes — and how
            it looks.
          </h2>
        </TextReveal>
      </div>

      <div className="col-start-2 col-end-5 mt-[6svh] min-w-0 px-(--grid-gutter) text-left md:col-start-5 md:col-end-8 md:mt-[10svh]">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light max-w-full text-[18px] leading-normal wrap-break-word text-black md:text-[min(1.35vw,2svh)]">
            We cook for private hosts and companies across the city. Seasonal
            plates, salads and cold-pressed juices, prepared each morning and
            delivered ready to serve. We run events end to end, and keep a
            coffee desk open for anyone passing by.
          </p>

          <Link
            href={routes.about}
            className="group mt-5 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
          >
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
              About us
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </Link>
        </TextReveal>
      </div>
    </GridSection>
  );
}
