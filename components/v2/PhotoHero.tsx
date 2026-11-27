import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import { CellGrid } from "@/components/v2/CellGrid";
import { HeroWordCycle } from "@/components/v2/HeroWordCycle";
import { VeilToggle } from "@/components/v2/VeilToggle";

type PhotoHeroProps = {
  /** The five words, in order: "Brunch", "Lunch", "Catering"… */
  words: readonly string[];
  /** The brand's signature, shown small in brackets: "Life is moments". */
  signature: string;
  /** Empty: no sentence under the signature (the owners removed it). */
  lead: string;
  /**
   * The photograph: a URL from the Studio (with its blur placeholder), or a
   * bundled one until one is uploaded.
   */
  image: string | StaticImageData;
  blurDataURL?: string;
  /**
   * "light" for a light photograph: black type and sky lines, and the navbar
   * turns black over it too (`data-hero-tone`, read by Navbar and
   * globals.css). Set in the Studio, "Page d'accueil".
   */
  tone?: "dark" | "light";
  /**
   * A light dark veil over the photo, heavier in the centre where the type
   * sits, so white type reads on a busy or bright photo. Dark tone only.
   * `?veil=off` in the address hides it, to compare (temporary).
   */
  veil?: boolean;
};

/**
 * The home hero as the owners asked (their text document, 26 November 2026,
 * page 3): "Life is moments" is no longer the headline. In its place the
 * words BRUNCH · LUNCH · CATERING · COFFEE CART · DELIVERY, coming in one by
 * one, smaller than the old slogan; then "( Life is moments )" smaller still,
 * in brackets like the logo; no sentence under it.
 *
 * Their photographs are bright, so the default is the light tone: black type,
 * sky lines, and a black navbar over it. A dark photo from the Studio sets
 * "Sombre" and everything turns cream.
 *
 * The words arrive with a CSS animation (globals.css, `hero-word`), each a
 * beat after the one before; with reduced motion they are simply there. One
 * screen: the viewport minus the announcement bar when it is on. The navbar
 * is transparent over it (`data-transparent-nav`).
 */
export function PhotoHero({
  words,
  signature,
  lead,
  image,
  blurDataURL,
  tone = "dark",
  veil = true,
}: PhotoHeroProps) {
  const light = tone === "light";
  const line = signature.replace(/\s+/g, " ").trim();
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

      <VeilToggle />
      {veil && !light && (
        <div
          aria-hidden
          className="hero-veil pointer-events-none absolute inset-0"
          style={{
            background:
              // A band under the navbar, so white links read on a bright edge,
              // then the centre for the words.
              "linear-gradient(to bottom, rgb(0 0 0 / 0.3), rgb(0 0 0 / 0) 22%), radial-gradient(ellipse 70% 60% at 50% 50%, rgb(0 0 0 / 0.32), rgb(0 0 0 / 0.14) 70%, rgb(0 0 0 / 0.08))",
          }}
        />
      )}

      {/* The frame only: cream over a dark photo, sky over a light one. */}
      <CellGrid
        lineClassName={light ? "bg-sky" : "bg-cream"}
        cells={false}
        readout={false}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-(--grid-inset) text-center">
        {/* A try (27 November 2026): one word at a time, in brackets, with
            the block reveal. The owners' row of five stays behind
            ?hero=list to compare. */}
        <HeroWordCycle
          words={words}
          className="font-owners-narrow-bold text-[13vw] leading-none tracking-[-0.005em] whitespace-nowrap uppercase md:text-[min(7vw,13svh)]"
          list={
            <p
              aria-label={words.join(", ")}
              className="font-owners-narrow-bold flex flex-col items-center text-[13vw] leading-[0.95] tracking-[-0.005em] uppercase md:flex-row md:flex-nowrap md:justify-center md:gap-x-[0.35em] md:text-[min(3.5vw,8svh)] md:leading-none"
            >
              {words.map((word, index) => (
                <span
                  key={word}
                  aria-hidden
                  className="hero-word inline-flex items-center gap-x-[0.35em] whitespace-nowrap"
                  style={{ "--hero-word-index": index } as CSSProperties}
                >
                  {index > 0 && <span className="hidden md:inline">·</span>}
                  {word}
                </span>
              ))}
            </p>
          }
        />

        {line && (
          <p
            className="hero-word font-owners-medium mt-[3svh] text-[13px] tracking-wide uppercase md:text-[15px]"
            style={{ "--hero-word-index": words.length + 1 } as CSSProperties}
          >
            ( {line} )
          </p>
        )}

        {lead && (
          <p
            className="hero-word font-archivo-light mt-[2svh] max-w-[40ch] text-(length:--body-text) leading-snug text-balance"
            style={{ "--hero-word-index": words.length + 2 } as CSSProperties}
          >
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
