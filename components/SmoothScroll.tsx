"use client";

import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { type ReactNode, useEffect, useRef } from "react";
import {
  prefersReducedMotion,
  ScrollTrigger,
  scheduleScrollTriggerRefresh,
} from "@/lib/gsap";

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    // The wheel scrolls natively for anyone who asked for less motion: the
    // eased glide is exactly the kind of motion that setting is for. Lenis
    // stays mounted — ScrollTrigger is wired to it — and reads this option on
    // every wheel event, so following the setting live is one assignment.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      lenis.options.smoothWheel = !prefersReducedMotion();
    };
    applyMotionPreference();
    reduceMotion.addEventListener("change", applyMotionPreference);

    /*
     * A refresh is wanted on mount and again on `load`. Each is a full-document
     * forced layout, roughly 100ms apart, and the second throws away the
     * first's measurements, so both are requests rather than calls: the shared
     * scheduler in lib/gsap folds them, and every TextReveal arming at the same
     * time, into one refresh per frame.
     */
    scheduleScrollTriggerRefresh();

    if (document.readyState !== "complete") {
      window.addEventListener("load", scheduleScrollTriggerRefresh);
    }

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      reduceMotion.removeEventListener("change", applyMotionPreference);
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
