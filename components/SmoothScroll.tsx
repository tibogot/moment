"use client";

import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { type ReactNode, useEffect, useRef } from "react";
import {
  ScrollTrigger,
  scheduleScrollTriggerRefresh,
} from "@/lib/gsapConfig";

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    /*
     * Two unconditional refreshes used to run here — one on mount and another
     * on `load`, each a full-document forced layout roughly 100ms apart, and
     * the first one's measurements were thrown away by the second. Both are now
     * requests rather than calls: the shared scheduler in lib/gsapConfig folds
     * them, and every TextReveal arming at the same time, into one refresh per
     * frame.
     */
    scheduleScrollTriggerRefresh();

    if (document.readyState !== "complete") {
      window.addEventListener("load", scheduleScrollTriggerRefresh);
    }

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("load", scheduleScrollTriggerRefresh);
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
