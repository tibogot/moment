import heroImage from "@/public/images/gemini-moment.webp";
import { urlFor } from "@/lib/sanity/image";
import type { HomePageImages } from "@/lib/sanity/queries";
import { GridLines } from "@/components/GridLines";
import { Lines } from "@/components/Lines";
import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import TextReveal from "@/components/TextReveal";
import { REVEAL_HERO } from "@/lib/colors";
import {
  GRID_COLUMNS,
  GRID_COLUMNS_MOBILE,
  HERO_GRID_HOLES,
  HERO_GRID_HOLES_MOBILE,
} from "@/lib/grid";

type HeroProps = {
  copy: { headline: string; lead: string };
  /** From the Studio. Null until someone uploads one, and then this is it. */
  image?: HomePageImages["hero"];
};

export function Hero({ copy, image }: HeroProps) {
  // 2400 wide rather than SanityImage's default 1600: this one is full-bleed
  // and oversized by 30% again for the parallax drift, so it is the widest
  // image on the site by some margin.
  const heroSrc = image
    ? urlFor(image).width(2400).auto("format").url()
    : heroImage;
  return (
    <section
      className="relative h-svh w-full overflow-hidden"
      data-transparent-nav
    >
      <HeroParallaxImage src={heroSrc} blurDataURL={image?.lqip} />
      <div className="absolute inset-0 bg-black/20" aria-hidden />

      <GridLines
        ruled
        columns={GRID_COLUMNS_MOBILE}
        holes={HERO_GRID_HOLES_MOBILE}
        className="md:hidden"
      />
      <GridLines
        ruled
        columns={GRID_COLUMNS}
        holes={HERO_GRID_HOLES}
        className="hidden md:block"
      />

      <div
        className="absolute inset-0 grid text-cream"
        style={{
          gridTemplateColumns: "var(--grid-columns)",
          gridTemplateRows: "var(--grid-rows)",
        }}
      >
        {/* text-left is required: the TextReveal CSS centres each split line
            unless an ancestor opts out. */}
        <div className="col-start-2 col-end-5 row-start-4 row-end-5 min-w-0 self-end px-(--grid-gutter) pb-4 text-left md:col-end-7 md:row-start-3 md:row-end-5 md:pb-[3.3svh]">
          <TextReveal
            animateOnScroll={false}
            blockColor={REVEAL_HERO}
            delay={0.25}
          >
            {/* The slogan, not the page's subject — it names neither the trade
                nor the city, and the h1 is worth more than that. IntroSection
                carries it instead, one section down: "Un traiteur bruxellois…".
                A p, not a heading of any level: this line is display type, and
                inventing an h2 for it above the real h1 would be worse than
                the h1 it used to be. Nothing about how it looks changes. */}
            <p
              className="font-owners-narrow-bold max-w-full leading-[0.9] tracking-[-0.005em] uppercase"
              style={{ fontSize: "var(--hero-headline)" }}
            >
              <Lines text={copy.headline} />
            </p>
          </TextReveal>
        </div>

        <div className="col-start-3 col-end-5 row-start-3 row-end-4 min-w-0 self-end px-(--grid-gutter) pb-4 text-right md:col-start-7 md:col-end-9 md:row-start-4 md:row-end-5 md:pb-[4.3svh]">
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
    </section>
  );
}
