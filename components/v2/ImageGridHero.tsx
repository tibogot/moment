// Photo off for now — sky background instead. Uncomment these, `heroSrc`
// and the two layers at the top of the section to bring it back.
// import heroImage from "@/public/images/gemini-moment.webp";
// import { urlFor } from "@/lib/sanity/image";
// import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import Image from "next/image";
import type { HomePageImages } from "@/lib/sanity/queries";
import { Lines } from "@/components/Lines";
import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { REVEAL_HERO } from "@/lib/colors";

type ImageGridHeroProps = {
  copy: { headline: string; lead: string; services: string[] };
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
      {/* 12 columns on desktop (9 on tablet, 4 on a phone): smaller cells
          keep the full-screen hero near 3/4 on any screen (about 0.72–0.78),
          the charter's "adapt for a coherent result". Chosen over 8 (0.65–
          0.88, near square on wide screens) and 16 (exact, but reads as a
          texture) on 19 November 2026. */}
      <CellGrid lineClassName="bg-sky" subdivide={1.5} />

      {/* The logotype, at the exact centre of the screen, simply laid over
          the grid: no cells cleared, the rules run on behind it. The same
          size as in the logo section below (300px at 1440). */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/brand/Moment-Logotype.svg"
          alt="Moment"
          width={1437}
          height={220}
          priority
          // The file is cream for the navbar; black here, as in the charter.
          className="h-auto w-[clamp(120px,21vw,420px)] brightness-0"
        />
      </div>

      {/* What Moment does, in the type of the navbar's links: inside the
          grid, centred at the foot of the last row of cells, a gutter above
          its bottom rule. Laid over the grid like the logo. */}
      <ul
        className="font-owners-medium absolute inset-x-0 flex items-center justify-center gap-x-[clamp(6px,2vw,14px)] px-(--grid-inset) text-[11px] tracking-wide uppercase md:text-[14px]"
        style={{ bottom: "calc(var(--grid-band) + var(--grid-gutter))" }}
      >
        {copy.services.map((service, index) => (
          <li
            key={service}
            className="flex items-center gap-x-[clamp(6px,2vw,14px)] whitespace-nowrap"
          >
            {index > 0 && <span aria-hidden>-</span>}
            {service}
          </li>
        ))}
      </ul>

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
