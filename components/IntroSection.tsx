import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type IntroSectionProps = {
  copy: { headline: string; body: string };
  aboutLabel: string;
  /**
   * Temporary escape hatch so the un-indented headline can be viewed alongside
   * the indented one — see /coffee. Drop the prop once the call is made.
   */
  indentFirstLine?: boolean;
  /**
   * `h1` on the home page, where this line is the page's subject: it names the
   * trade and the city, which the hero's slogan above it deliberately does not.
   * Stays `h2` everywhere else — /coffee opens with a PageIntro that owns the
   * h1 already, and a second one here would be competing with it.
   */
  headingAs?: "h1" | "h2";
};

export function IntroSection({
  copy,
  aboutLabel,
  indentFirstLine = true,
  headingAs: Heading = "h2",
}: IntroSectionProps) {
  return (
    <GridSection className="pt-[10svh] pb-[14svh]">
      {/* Long sky rule setting the section off from the hero. */}
      <div className="col-span-full mb-[6svh] h-(--grid-line) bg-sky" />
      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <Heading
            className={cn(
              "font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(6vw,9svh)]",
              indentFirstLine && "indent-first-line intro-headline"
            )}
          >
            {copy.headline}
          </Heading>
        </TextReveal>
      </div>

      <div className="col-start-2 col-end-5 mt-[6svh] min-w-0 px-(--grid-gutter) text-left md:col-start-5 md:col-end-8 md:mt-[10svh]">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light max-w-full text-(length:--body-text) leading-normal wrap-break-word text-black">
            {copy.body}
          </p>

          <Link
            href={routes.about}
            className="group mt-5 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
          >
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
              {aboutLabel}
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
