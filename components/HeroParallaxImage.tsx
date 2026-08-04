"use client";

import { useGSAP } from "@gsap/react";
import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsapConfig";
import { GRID_VIEWPORT_IMAGE_SIZES } from "@/lib/grid";

type HeroParallaxImageProps = {
  /**
   * Statically imported, so Next generates the blur placeholder at build time.
   * A string path would skip that and leave the hero blank while it loads.
   */
  src: StaticImageData;
  alt?: string;
  sizes?: string;
};

export function HeroParallaxImage({
  src,
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
          placeholder="blur"
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </div>
  );
}
