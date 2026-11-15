// Photo off for now — sky background instead. Uncomment these, `heroSrc`
// and the two layers at the top of the section to bring it back.
// import heroImage from "@/public/images/gemini-moment.webp";
// import { urlFor } from "@/lib/sanity/image";
// import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import type { HomePageImages } from "@/lib/sanity/queries";
import { Lines } from "@/components/Lines";
import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { REVEAL_HERO } from "@/lib/colors";

type ImageGridHeroProps = {
  copy: { headline: string; lead: string };
  image?: HomePageImages["hero"];
  /** Headline and lead over the grid. Off to judge the grid on its own. */
  withText?: boolean;
};

/**
 * The live hero — photograph, transparent nav, headline and lead — on the v2
 * grid. The type is placed against the frame rather than against cells, since
 * the cell count changes with the screen; CellGrid clears whatever cells the
 * two `data-grid-hole` blocks land on.
 */
export function ImageGridHero({
  copy,
  // image,
  withText = true,
}: ImageGridHeroProps) {
  // const heroSrc = image
  //   ? urlFor(image).width(2400).auto("format").url()
  //   : heroImage;

  return (
    <section className="relative h-svh w-full overflow-hidden bg-cream">
      {/* <HeroParallaxImage src={heroSrc} blurDataURL={image?.lqip} />
      <div className="absolute inset-0 bg-black/10" aria-hidden /> */}

      {/* Sky rules on the cream page, like every page — the palette preview
          flips both, in step with the navbar. With the photo back, the rules
          go to bg-cream/60. */}
      <CellGrid lineClassName="bg-sky" />

      {withText && (
        <div
          className="absolute flex flex-col-reverse gap-6 text-cream md:flex-row md:items-end md:justify-between md:gap-10"
          style={{
            left: "var(--grid-margin)",
            right: "var(--grid-margin)",
            bottom: "var(--grid-band)",
            padding: "0 var(--grid-gutter)",
            paddingBottom: "max(1rem, 3.3svh)",
          }}
        >
          <div data-grid-hole className="min-w-0 text-left md:max-w-[68%]">
            <TextReveal
              animateOnScroll={false}
              blockColor={REVEAL_HERO}
              delay={0.25}
            >
              <p
                className="font-owners-narrow-bold max-w-full leading-[0.9] tracking-[-0.005em] uppercase"
                style={{ fontSize: "var(--hero-headline)" }}
              >
                <Lines text={copy.headline} />
              </p>
            </TextReveal>
          </div>

          <div
            data-grid-hole
            className="ml-auto w-[66%] min-w-0 text-right md:ml-0 md:w-[24%]"
          >
            <TextReveal
              animateOnScroll={false}
              blockColor={REVEAL_HERO}
              delay={0.5}
              stagger={0.08}
              duration={0.6}
            >
              <p
                className="font-archivo-light max-w-full text-balance leading-[1.2]"
                style={{ fontSize: "var(--hero-body)" }}
              >
                {copy.lead}
              </p>
            </TextReveal>
          </div>
        </div>
      )}
    </section>
  );
}
