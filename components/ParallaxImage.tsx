"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsapConfig";
import { cn } from "@/lib/utils";

type ParallaxImageProps = {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Image that drifts inside an overflow-hidden frame on scroll. The oversized
 * layer never paints outside the clip — only the parent frame is visible.
 */
export function ParallaxImage({
  src,
  alt = "",
  sizes,
  priority = false,
  className,
  style,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const image = imageRef.current;
      if (!container || !image) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      // Image is 24% taller than the frame (top -12%). Drift covers that
      // slack so the edges never empty out mid-scroll.
      const tween = gsap.fromTo(
        image,
        { yPercent: 0 },
        {
          yPercent: 9.5,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={style}
    >
      <div
        ref={imageRef}
        className="absolute inset-x-0 top-[-12%] h-[124%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </div>
  );
}
