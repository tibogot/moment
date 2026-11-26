import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import { Lines } from "@/components/Lines";
import TextReveal from "@/components/TextReveal";
// import { LocaleLink as Link } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import { REVEAL_BLOCK, REVEAL_HERO } from "@/lib/colors";
// import { routes } from "@/lib/routes";

type PhotoHeroProps = {
  headline: string;
  lead: string;
  cta: string;
  /**
   * The photograph: a URL from the Studio (with its blur placeholder), or a
   * bundled one until one is uploaded.
   */
  image: string | StaticImageData;
  blurDataURL?: string;
  /**
   * "light" for a light photograph: black type and sky lines, and the navbar
   * turns black over it too (`data-hero-tone`, read by Navbar). Set in the
   * Studio, "Page d'accueil".
   */
  tone?: "dark" | "light";
};

/**
 * A home hero without the visible cells (25 November 2026, after Thibault's
 * Figma): the photograph full screen, only the frame drawn over it — the
 * two spines on the margins and the rules of the two bands — in cream, and
 * the type centred: the headline, the lead, the button.
 *
 * Both texts come in with the site's block reveal, doubled (after
 * good-fella.com): a sky block crosses each line, a cream one follows over
 * it, then they leave in turn — on arrival (not on scroll), the headline
 * first, the lead after. LCP is the full-screen photograph, loaded with
 * priority, not this type, so holding the text back costs PageSpeed nothing.
 *
 * One screen: the viewport minus the announcement bar when it is on. The
 * navbar is transparent over it, as over the live home's hero
 * (`data-transparent-nav`; the path is listed in Navbar).
 */
export function PhotoHero({
  headline,
  lead,
  image,
  blurDataURL,
  tone = "dark",
}: PhotoHeroProps) {
  const light = tone === "light";
  return (
    <section
      className={`relative w-full overflow-hidden ${light ? "text-black" : "text-cream"}`}
      style={
        {
          height: "calc(100svh - var(--announcement-h, 0px))",
        } as CSSProperties
      }
      data-transparent-nav
      data-hero-tone={tone}
    >
      <HeroParallaxImage src={image} blurDataURL={blurDataURL} />

      {/* The frame only: cream over a dark photo, sky over a light one. */}
      <CellGrid
        lineClassName={light ? "bg-sky" : "bg-cream"}
        cells={false}
        readout={false}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-(--grid-inset) text-center">
        <TextReveal
          animateOnScroll={false}
          blockColor={REVEAL_BLOCK}
          followColor={REVEAL_HERO}
          delay={0.25}
        >
          <p className="font-owners-narrow-bold text-[17vw] leading-[0.85] tracking-[-0.005em] uppercase md:text-[min(10vw,17svh)]">
            <Lines text={headline} />
          </p>
        </TextReveal>
        <div className="mt-[3svh]">
          <TextReveal
            animateOnScroll={false}
            blockColor={REVEAL_BLOCK}
            followColor={REVEAL_HERO}
            delay={0.6}
            stagger={0.08}
            duration={0.6}
          >
            <p className="font-archivo-light max-w-[40ch] text-(length:--body-text) leading-snug text-balance">
              {lead}
            </p>
          </TextReveal>
        </div>
        {/* The button, off for now (25 November 2026). Uncomment it, the
            two imports at the top and "cta" in the props to bring it back.
        <Link
          href={routes.about}
          className="group mt-[4svh] inline-block border border-sky bg-sky px-4 py-3 text-black transition-colors duration-500 hover:bg-cream"
        >
          <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
            {cta}
            <span
              className="transition-transform duration-500 group-hover:translate-x-1.5"
              aria-hidden
            >
              &rarr;
            </span>
          </span>
        </Link>
        */}
      </div>
    </section>
  );
}
