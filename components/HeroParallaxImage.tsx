"use client";

import { useGSAP } from "@gsap/react";
import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsapConfig";
import { GRID_VIEWPORT_IMAGE_SIZES } from "@/lib/grid";

type HeroParallaxImageProps = {
  /**
   * A statically imported image, or a URL.
   *
   * The static import is the better of the two: Next generates the blur
   * placeholder from it at build time. A URL cannot be inspected at build time,
   * so one coming from the Studio has to bring its own `blurDataURL` — see
   * `lqip` in `getHomePageImages`. Without either, the hero is grey until the
   * full image lands, which on a full-screen photograph is very visible.
   */
  src: string | StaticImageData;
  blurDataURL?: string;
  alt?: string;
  sizes?: string;
};

export function HeroParallaxImage({
  src,
  blurDataURL,
  alt = "",
  sizes = GRID_VIEWPORT_IMAGE_SIZES,
}: HeroParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = containerRef.current?.closest("section");
      const image = imageRef.current;
      if (!section || !image) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      const tween = gsap.to(image, {
        // The image already starts 15% above its clipping frame in CSS.
        // Starting at yPercent: 0 avoids a visible hydration jump.
        yPercent: 11.5,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div
        ref={imageRef}
        className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          preload
          // A static import carries its own placeholder; a URL only blurs if a
          // preview came with it. Asking for "blur" without one throws.
          placeholder={
            typeof src !== "string" || blurDataURL ? "blur" : "empty"
          }
          blurDataURL={blurDataURL}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </div>
  );
}
