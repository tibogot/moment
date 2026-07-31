"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsapConfig";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

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

  useGSAP(
    () => {
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
        } catch (e) {
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
        const split = SplitText.create(element as gsap.DOMTarget, {
          type: "lines",
          linesClass: "block-line++",
          lineThreshold: 0.1,
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
        gsap.set(containerRef.current, { visibility: "visible" });
        // Force a reflow to ensure visibility change is applied
        containerRef.current.offsetHeight;
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

              const trigger = ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top 90%",
                once: true,
                onEnter: () => tl.play(),
              });
              triggers.current.push(trigger);
            });

            // Refresh after all triggers are created and DOM is stable
            ScrollTrigger.refresh();
          });
        });
      } else {
        blocks.current.forEach((block, index) => {
          const tl = createBlockRevealAnimation(
            block,
            lines.current[index],
            index
          );
          timelines.current.push(tl);
        });
      }

      // Cleanup function
      return () => {
        // Kill all animations and triggers
        triggers.current.forEach((t) => {
          try {
            t.kill();
          } catch (e) {
            // Ignore errors
          }
        });
        timelines.current.forEach((tl) => {
          try {
            tl.kill();
          } catch (e) {
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
          } catch (e) {
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
      dependencies: [animateOnScroll, delay, blockColor, stagger, duration],
    }
  );

  return (
    <div ref={containerRef} data-text-reveal>
      {children}
    </div>
  );
}
