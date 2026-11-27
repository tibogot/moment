import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import { CellGrid } from "@/components/v2/CellGrid";
import { VeilToggle } from "@/components/v2/VeilToggle";

type PhotoHeroProps = {
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
  /** The Studio's description of the photo; empty = decorative. */
  alt?: string;
  /**
   * "light" for a light photograph: black type and sky lines, and the navbar
   * turns black over it too (`data-hero-tone`, read by Navbar and
   * globals.css). Set in the Studio, "Page d'accueil".
   */
  tone?: "dark" | "light";
  /**
   * A light dark veil over the photo, a band under the navbar and a soft
   * centre, so white type reads on a busy or bright photo. Dark tone only.
   * `?veil=off` in the address hides it, to compare (temporary).
   */
  veil?: boolean;
};

/**
 * The home hero while its new design is drawn (27 November 2026): the
 * photograph full screen, the veil, the frame, and only "( Life is moments )".
 *
 * The owners asked for BRUNCH · LUNCH · CATERING · COFFEE CART · DELIVERY in
 * place of the slogan. Tried as a row and one word at a time with the block
 * reveal (commits 7f1005b, 33a3d27): it read as a list, not as a hero, so it
 * is out until the new design — their wish to say what Moment does up front
 * is noted for it.
 *
 * White type by default (the dark tone): on their bright photo it reads
 * better than black. One screen: the viewport minus the announcement bar when
 * it is on. The navbar is transparent over it (`data-transparent-nav`).
 */
export function PhotoHero({
  signature,
  lead,
  image,
  blurDataURL,
  alt = "",
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
      <HeroParallaxImage src={image} blurDataURL={blurDataURL} alt={alt} />

      <VeilToggle />
      {veil && !light && (
        <div
          aria-hidden
          className="hero-veil pointer-events-none absolute inset-0"
          style={{
            background:
              // A band under the navbar, so white links read on a bright edge,
              // then the centre for the type.
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
        {line && (
          <p className="font-owners-medium text-[13px] tracking-wide uppercase md:text-[15px]">
            ( {line} )
          </p>
        )}

        {lead && (
          <p className="font-archivo-light mt-[2svh] max-w-[40ch] text-(length:--body-text) leading-snug text-balance">
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
