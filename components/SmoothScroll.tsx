"use client";

import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { type ReactNode, useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsapConfig";

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    const refreshScrollTrigger = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    };

    refreshScrollTrigger();

    if (document.readyState === "complete") {
      refreshScrollTrigger();
    } else {
      window.addEventListener("load", refreshScrollTrigger);
    }

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("load", refreshScrollTrigger);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
