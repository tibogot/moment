"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary } from "@/components/LocaleProvider";
import { REVEAL_BLOCK } from "@/lib/colors";
import { finishIfReducedMotion, gsap } from "@/lib/gsap";
import { aboutNav } from "@/lib/routes";
// Placeholders (25 November 2026) until the owners pick the house's own.
import firstImage from "@/public/images/svitlana.jpg";
import secondImage from "@/public/images/nicole-herrero.jpg";

const linkClassName =
  "group block w-full cursor-pointer py-2.5 font-owners-medium text-[12px] uppercase tracking-wide";

const linkLabelClassName = "animated-underline";

type AboutNavMenuProps = {
  onNavigate?: () => void;
  /**
   * The panel is open on About. The navbar keeps this menu mounted after it
   * closes, so the photographs' reveal plays on each opening, not on mount.
   */
  open?: boolean;
};

/**
 * The text's block reveal (TextReveal), on the photographs: a block of the
 * reveal colour grows across from the left, the photograph appears under it,
 * the block leaves to the right. Same duration and easing as the text; the
 * second photograph a beat after the first. As the block leaves, the
 * photograph zooms out gently inside its frame, to its own size. It starts while the panel is
 * still opening, so the two finish together.
 */
const REVEAL_DURATION = 0.75;
const REVEAL_DELAY = 0.2;
const REVEAL_STAGGER = 0.15;
/** The photograph, a little enlarged under the block, settles to its size. */
const ZOOM_FROM = 1.2;
const ZOOM_DURATION = 1.4;

/**
 * What sits behind "About": the story, the news, the FAQ, and two
 * photographs.
 *
 * Deliberately not built on ShopNavMenu. That panel is a browse surface — a
 * column of collections against a live product preview — and three text links
 * dropped into it would read as a page that failed to load. The labels still
 * sit on the left in the same type; each row is a hit target across the
 * content columns so you don't have to aim at the letters, and stops at the
 * page padding.
 *
 * Since 25 November 2026 the panel is taller and carries two portrait
 * photographs on the right, across the last three columns: the
 * links alone made a thin strip. The panel still opens only as far as its
 * content — now the photographs set its height.
 */
export function AboutNavMenu({ onNavigate, open = false }: AboutNavMenuProps) {
  const dict = useDictionary();
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Closing: leave the photographs as they are while the panel folds
    // away; the next opening resets them.
    if (!open) return;
    const images = imageRefs.current.filter(Boolean);
    const blocks = blockRefs.current.filter(Boolean);
    gsap.set(images, { opacity: 0, scale: ZOOM_FROM });
    gsap.set(blocks, { scaleX: 0, transformOrigin: "left center" });

    const timeline = gsap.timeline();
    // One small timeline per photograph, each placed at its own start: a
    // chain on the main timeline would queue the second behind the first.
    blocks.forEach((block, index) => {
      const reveal = gsap
        .timeline()
        .to(block, {
          scaleX: 1,
          duration: REVEAL_DURATION,
          ease: "power4.inOut",
        })
        .set(images[index], { opacity: 1 })
        .set(block, { transformOrigin: "right center" })
        .to(block, {
          scaleX: 0,
          duration: REVEAL_DURATION,
          ease: "power4.inOut",
        })
        // As the block leaves, the photograph settles: a slow zoom out
        // inside its frame, from the moment it appears.
        .to(
          images[index],
          { scale: 1, duration: ZOOM_DURATION, ease: "power3.out" },
          "<",
        );
      timeline.add(reveal, REVEAL_DELAY + index * REVEAL_STAGGER);
    });
    finishIfReducedMotion(timeline);
    return () => {
      timeline.kill();
    };
  }, [open]);

  return (
    <div
      className="grid border-t border-sky"
      style={{ gridTemplateColumns: "var(--grid-columns)" }}
    >
      <nav
        aria-label={dict.nav.about}
        className="col-start-2 col-end-5 row-start-1 flex flex-col self-start px-(--v2-pad) pt-[6svh] pb-[6svh]"
      >
        {aboutNav.map(({ key, href }) => (
          <Link
            key={key}
            href={href}
            className={linkClassName}
            onClick={onNavigate}
          >
            <span className={linkLabelClassName}>{dict.aboutNav[key]}</span>
          </Link>
        ))}
      </nav>

      {/* Two portraits across the last three columns, a cell's padding apart. Decorative: the links carry
          the meaning. */}
      <div
        className="col-start-6 col-end-9 row-start-1 flex gap-(--v2-pad) px-(--v2-pad) py-[6svh]"
        aria-hidden
      >
        {[firstImage, secondImage].map((image, index) => (
          <div
            key={index}
            className="relative aspect-3/4 min-w-0 flex-1 overflow-hidden"
          >
            <div
              ref={(element) => {
                imageRefs.current[index] = element;
              }}
              className="absolute inset-0"
            >
              <Image
                src={image}
                alt=""
                fill
                // Not the frame's width (~15vw): a landscape photograph covering
                // a 3/4 frame is drawn about twice as wide as the frame, and the
                // zoom adds 20% — 15vw made the browser fetch a file a third of
                // the width it was drawn at, and it showed.
                sizes="35vw"
                className="object-cover"
              />
            </div>
            <div
              ref={(element) => {
                blockRefs.current[index] = element;
              }}
              className="absolute inset-0"
              style={{ backgroundColor: REVEAL_BLOCK }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
