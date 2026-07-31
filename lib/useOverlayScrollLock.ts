"use client";

import { useLenis } from "@/components/SmoothScroll";
import { useEffect } from "react";

export function useOverlayScrollLock(active: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!active) return;

    lenis?.stop();

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const blockBackgroundScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-lenis-prevent]")) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("wheel", blockBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", blockBackgroundScroll, {
      passive: false,
    });

    return () => {
      lenis?.start();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("wheel", blockBackgroundScroll);
      window.removeEventListener("touchmove", blockBackgroundScroll);
    };
  }, [active, lenis]);
}
