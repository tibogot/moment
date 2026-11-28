"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary } from "@/components/LocaleProvider";
import { REVEAL_BLOCK } from "@/lib/colors";
import { finishIfReducedMotion, gsap } from "@/lib/gsap";
import { useAboutNav } from "@/components/AboutNavProvider";
import { CellGrid } from "@/components/v2/CellGrid";
// Placeholders (25 November 2026) until the owners pick the house's own.
import firstImage from "@/public/images/svitlana.jpg";
import secondImage from "@/public/images/nicole-herrero.jpg";

/* The bar's size, like the shop menu's families (28 November 2026): at 12px
   the two menus read as two different sizes side by side. */
const linkClassName =
  "group block w-full cursor-pointer py-2.5 font-owners-medium text-(length:--nav-text) uppercase tracking-wide";

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
 * On the page's 16-cell grid since 28 November 2026, like the shop menu (it
 * was the last panel on the old 7-column layout, and Shift + G showed no grid
 * on it): three rows; the links in one block over cells 1–10, then two
 * portraits of 3 cells by 3 rows — 3/4 — side by side. Every block is a
 * `data-grid-hole`, so the grid draws only the rules between them.
 */
const ROWS = 3;
export function AboutNavMenu({ onNavigate, open = false }: AboutNavMenuProps) {
  const dict = useDictionary();
  const aboutNav = useAboutNav();
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
    <div className="v2">
      <section className="relative border-b border-sky bg-cream">
        <CellGrid
          lineClassName="bg-sky"
          bands={false}
          readout={false}
          subdivide={2}
          linesOnTop
        />
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "var(--s-grid-columns)",
            gridTemplateRows: `repeat(${ROWS}, var(--s-cell-h))`,
          }}
        >
          <nav
            aria-label={dict.nav.about}
            data-grid-hole
            className="flex min-w-0 flex-col p-(--v2-pad)"
            style={{ gridColumn: "2 / span 10", gridRow: `1 / span ${ROWS}` }}
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

          {/* Two portraits, 3 cells by 3 rows each, filling their cells edge
          to edge like the shop menu's photo. Decorative: the links carry the
          meaning. */}
          {[firstImage, secondImage].map((image, index) => (
            <div
              key={index}
              aria-hidden
              data-grid-hole
              className="relative min-w-0 overflow-hidden"
              style={{
                gridColumn: `${12 + index * 3} / span 3`,
                gridRow: `1 / span ${ROWS}`,
              }}
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
                  // Not the frame's width (~19vw): a landscape photograph covering
                  // a 3/4 frame is drawn about twice as wide as the frame, and the
                  // zoom adds 20% — the frame's width made the browser fetch a
                  // file a third of the width it was drawn at, and it showed.
                  sizes="45vw"
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
      </section>
    </div>
  );
}
