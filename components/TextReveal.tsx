"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { SplitText } from "@/lib/gsapSplitText";
import { onIntroReady } from "@/lib/intro";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

/*
 * Each instance used to call ScrollTrigger.refresh() itself. The home page
 * mounts 16 of them, so 16 full-document re-measures landed within a couple of
 * frames of each other — enough main-thread stall that the hero's reveal, which
 * plays immediately rather than on scroll, rendered in two or three frames
 * instead of animating. Desktop absorbed the cost; mobile did not. Coalescing
 * them means the work happens once, after the last instance has registered.
 */
let refreshFrame: number | null = null;

function scheduleScrollTriggerRefresh() {
  if (refreshFrame !== null) cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = null;
    ScrollTrigger.refresh();
  });
}

/*
 * How far ahead of the viewport an instance arms itself. Has to clear the
 * ScrollTrigger below, which starts at "top 90%" — i.e. the moment the element
 * crosses into the bottom tenth of the screen. Splitting a full viewport-height
 * earlier means the lines and their revealer blocks are in place, at rest, well
 * before anything is asked to play.
 */
const ARM_MARGIN = "100% 0px";

/*
 * Splitting is the expensive half of this component: SplitText writes into the
 * DOM and then measures it, per line, and the home page renders 24 instances.
 * Doing that during hydration meant two dozen interleaved write/read cycles in
 * the same task — half a second of style and layout for copy that was mostly
 * several screens down and hidden anyway.
 *
 * So each instance waits until it is roughly one screen away. One shared
 * observer rather than 24: the margin is identical for all of them, and this is
 * a component that exists to keep work off the main thread.
 */
type ArmCallback = () => void;

let armObserver: IntersectionObserver | null = null;
const armCallbacks = new WeakMap<Element, ArmCallback>();

function observeForArming(element: Element, onArm: ArmCallback) {
  if (typeof IntersectionObserver === "undefined") {
    onArm();
    return () => {};
  }

  armObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        armObserver?.unobserve(entry.target);
        const callback = armCallbacks.get(entry.target);
        armCallbacks.delete(entry.target);
        callback?.();
      }
    },
    { rootMargin: ARM_MARGIN }
  );

  armCallbacks.set(element, onArm);
  armObserver.observe(element);

  return () => {
    armCallbacks.delete(element);
    armObserver?.unobserve(element);
  };
}

interface TextRevealProps {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  blockColor?: string;
  stagger?: number;
  duration?: number;
}

export default function TextReveal({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#000",
  stagger = 0.15,
  duration = 0.75,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRefs = useRef<SplitText[]>([]);
  const lines = useRef<Element[]>([]);
  const blocks = useRef<HTMLDivElement[]>([]);
  const triggers = useRef<ScrollTriggerType[]>([]);
  const timelines = useRef<gsap.core.Timeline[]>([]);
  const releaseIntroRef = useRef<(() => void) | null>(null);

  /*
   * Intro copy is above the fold by definition and gated on lib/intro.ts
   * anyway, so it arms on mount. Everything else waits for the observer.
   */
  const [armed, setArmed] = useState(!animateOnScroll);

  useEffect(() => {
    if (armed || !containerRef.current) return;
    return observeForArming(containerRef.current, () => setArmed(true));
  }, [armed]);

  useGSAP(
    () => {
      if (!armed) return;
      if (!containerRef.current) return;

      // Ensure element is in the DOM and has content
      if (!containerRef.current.isConnected) return;

      // Cleanup previous state - kill all animations first
      triggers.current.forEach((t) => t.kill());
      timelines.current.forEach((tl) => tl.kill());
      gsap.killTweensOf([...blocks.current, ...lines.current]);

      // Clean up DOM wrappers before reverting SplitText
      const wrappers = containerRef.current.querySelectorAll(
        ".block-line-wrapper"
      );
      wrappers.forEach((wrapper: Element) => {
        if (wrapper.parentNode && wrapper.firstChild) {
          // Move the line element back to its original position
          const line = wrapper.firstChild;
          wrapper.parentNode.insertBefore(line, wrapper);
          wrapper.remove();
        }
      });

      // Revert SplitText after DOM cleanup
      splitRefs.current.forEach((split) => {
        try {
          split?.revert();
        } catch {
          // Ignore errors if already reverted
        }
      });

      // Reset all refs
      splitRefs.current = [];
      lines.current = [];
      blocks.current = [];
      triggers.current = [];
      timelines.current = [];

      // Reset container visibility and ensure clean state
      if (containerRef.current) {
        gsap.set(containerRef.current, {
          visibility: "hidden",
          clearProps: "opacity",
        });

        // Double-check for any leftover wrappers and remove them
        const leftoverWrappers = containerRef.current.querySelectorAll(
          ".block-line-wrapper"
        );
        if (leftoverWrappers.length > 0) {
          leftoverWrappers.forEach((wrapper: Element) => {
            if (wrapper.parentNode && wrapper.firstChild) {
              const line = wrapper.firstChild;
              wrapper.parentNode.insertBefore(line, wrapper);
              wrapper.remove();
            }
          });
        }
      }

      let elements: Element[] = [];

      if (containerRef.current?.hasAttribute("data-copy-wrapper")) {
        // If data-copy-wrapper, split each child separately
        elements = Array.from(containerRef.current.children);
      } else if (containerRef.current) {
        // Otherwise, split the direct child element (not the wrapper)
        // If there's a single child, use it; otherwise use the container's text content
        const children = Array.from(containerRef.current.children);
        if (children.length > 0) {
          // Use the first child if it's a single element
          elements = children.length === 1 ? [children[0]] : children;
        } else {
          // If no children, the text is directly in the container
          elements = [containerRef.current];
        }
      }

      elements.forEach((element) => {
        // aria: "none" — SplitText's default ("auto") sets aria-label on the
        // split root. That is illegal on <p>/<h*> (ARIA naming prohibited on
        // those roles) and fails PageSpeed / axe. Line-only splits keep the
        // text readable in DOM order, so the label is unnecessary.
        const split = SplitText.create(element as gsap.DOMTarget, {
          type: "lines",
          linesClass: "block-line++",
          lineThreshold: 0.1,
          aria: "none",
        });

        splitRefs.current.push(split);

        split.lines.forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.className = "block-line-wrapper";
          if (line.parentNode) {
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
          }

          const block = document.createElement("div");
          block.className = "block-revealer";
          block.style.backgroundColor = blockColor;
          wrapper.appendChild(block);

          lines.current.push(line);
          blocks.current.push(block);
        });
      });

      gsap.set(lines.current, { opacity: 0 });
      gsap.set(blocks.current, { scaleX: 0, transformOrigin: "left center" });

      // Make container visible now that GSAP has initialized
      if (containerRef.current) {
        /*
         * No forced reflow here. gsap.set writes the inline style
         * synchronously, and nothing below reads layout in this task — the
         * scroll branch measures inside a double rAF, by which point the
         * browser has laid out and painted on its own schedule. Reading
         * offsetHeight only bought a synchronous layout per instance.
         */
        gsap.set(containerRef.current, { visibility: "visible" });
      }

      const createBlockRevealAnimation = (
        block: HTMLDivElement,
        line: Element,
        index: number
      ) => {
        const tl = gsap.timeline({ delay: delay + index * stagger });

        tl.to(block, { scaleX: 1, duration: duration, ease: "power4.inOut" });
        tl.set(line, { opacity: 1 });
        tl.set(block, { transformOrigin: "right center" });
        tl.to(block, { scaleX: 0, duration: duration, ease: "power4.inOut" });

        return tl;
      };

      // Create animations and triggers AFTER visibility is set
      if (animateOnScroll) {
        // Wait for next frame to ensure visibility change is applied before creating triggers
        // This is crucial for proper positioning on page refresh
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!containerRef.current || !containerRef.current.isConnected)
              return;

            blocks.current.forEach((block, index) => {
              const tl = createBlockRevealAnimation(
                block,
                lines.current[index],
                index
              );
              tl.pause();
              timelines.current.push(tl);
            });

            // One trigger for the whole block, not one per line. Every line
            // shared the same trigger element and start position anyway, so
            // the extra ScrollTriggers only ever added work to each refresh —
            // 51 of them on the home page instead of 16.
            const started = timelines.current.slice();
            const trigger = ScrollTrigger.create({
              trigger: containerRef.current,
              start: "top 90%",
              once: true,
              onEnter: () => started.forEach((tl) => tl.play()),
            });
            triggers.current.push(trigger);

            scheduleScrollTriggerRefresh();
          });
        });
      } else {
        // Built paused and released by the shared intro gate. Starting here
        // would drop the reveal straight into hydration, where it renders in a
        // handful of frames instead of animating — see lib/intro.ts.
        blocks.current.forEach((block, index) => {
          const tl = createBlockRevealAnimation(
            block,
            lines.current[index],
            index
          );
          tl.pause();
          timelines.current.push(tl);
        });

        const queued = timelines.current.slice();
        releaseIntroRef.current = onIntroReady(() =>
          queued.forEach((tl) => tl.play())
        );
      }

      // Cleanup function
      return () => {
        releaseIntroRef.current?.();
        releaseIntroRef.current = null;
        // Kill all animations and triggers
        triggers.current.forEach((t) => {
          try {
            t.kill();
          } catch {
            // Ignore errors
          }
        });
        timelines.current.forEach((tl) => {
          try {
            tl.kill();
          } catch {
            // Ignore errors
          }
        });
        gsap.killTweensOf([...blocks.current, ...lines.current]);

        // Clean up DOM wrappers first
        if (containerRef.current) {
          const wrappers = containerRef.current.querySelectorAll(
            ".block-line-wrapper"
          );

          wrappers.forEach((wrapper: Element) => {
            if (wrapper.parentNode && wrapper.firstChild) {
              const line = wrapper.firstChild;
              wrapper.parentNode.insertBefore(line, wrapper);
              wrapper.remove();
            }
          });
        }

        // Revert SplitText after DOM cleanup
        splitRefs.current.forEach((split) => {
          try {
            split?.revert();
          } catch {
            // Ignore errors if already reverted
          }
        });

        // Clear all refs
        splitRefs.current = [];
        lines.current = [];
        blocks.current = [];
        triggers.current = [];
        timelines.current = [];
      };
    },
    {
      scope: containerRef,
      dependencies: [
        armed,
        animateOnScroll,
        delay,
        blockColor,
        stagger,
        duration,
      ],
    }
  );

  return (
    <div ref={containerRef} data-text-reveal className="max-w-full min-w-0">
      {children}
    </div>
  );
}
