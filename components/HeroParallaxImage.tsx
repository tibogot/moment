"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsapConfig";

type HeroParallaxImageProps = {
  src: string;
  alt?: string;
};

export function HeroParallaxImage({ src, alt = "" }: HeroParallaxImageProps) {
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
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
