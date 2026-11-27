"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { REVEAL_BLOCK, REVEAL_HERO } from "@/lib/colors";

type HeroWordCycleProps = {
  words: readonly string[];
  className?: string;
  /**
   * The owners' version (all five words in a row), shown instead with
   * `?hero=list` in the address — a temporary switch to compare the two.
   */
  list?: React.ReactNode;
};

const noSubscription = () => () => {};
const onServer = () => false;

/** How long a word stays uncovered, in seconds. */
const HOLD = 1.6;
const SWEEP = 0.45;
/** The cream block runs this far behind the sky one — as in TextReveal. */
const FOLLOW = 0.12;

/**
 * The owners' five words one at a time, in brackets like the logo (27 November
 * 2026, a try): "( BRUNCH )", then "( LUNCH )"… Each change is the site's
 * block reveal — a sky block crosses the word, a cream one follows over it,
 * the word changes underneath, and they leave in turn to show the next one —
 * looping, where TextReveal plays once.
 *
 * Screen readers get the five words once, as a list in the label; with reduced
 * motion the words sit still, joined by dots.
 */
export function HeroWordCycle({ words, className, list }: HeroWordCycleProps) {
  const [index, setIndex] = useState(0);
  // Read once on the client; false while rendering on the server.
  const still = useSyncExternalStore(
    noSubscription,
    prefersReducedMotion,
    onServer,
  );
  const showList = useSyncExternalStore(
    noSubscription,
    () => new URLSearchParams(window.location.search).get("hero") === "list",
    onServer,
  );
  const blockRef = useRef<HTMLSpanElement>(null);
  const followRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (still) return;
    const block = blockRef.current;
    const follow = followRef.current;
    if (showList || !block || !follow || words.length < 2) return;

    gsap.set([block, follow], { scaleX: 0, transformOrigin: "left center" });

    const timeline = gsap.timeline({ repeat: -1, delay: 0.4 });
    // In: both blocks cover the word, left to right.
    timeline
      .set([block, follow], { transformOrigin: "left center" })
      .to(block, { scaleX: 1, duration: SWEEP, ease: "power3.inOut" }, HOLD)
      .to(
        follow,
        { scaleX: 1, duration: SWEEP, ease: "power3.inOut" },
        HOLD + FOLLOW,
      )
      // Covered: the next word.
      .call(() => setIndex((current) => (current + 1) % words.length))
      // Out: they leave to the right, the cream one first.
      .set([block, follow], { transformOrigin: "right center" })
      .to(follow, { scaleX: 0, duration: SWEEP, ease: "power3.inOut" })
      .to(
        block,
        { scaleX: 0, duration: SWEEP, ease: "power3.inOut" },
        `<${FOLLOW}`,
      );

    return () => {
      timeline.kill();
    };
  }, [words.length, showList, still]);

  if (showList && list) return <>{list}</>;

  if (still) {
    return (
      <p className={className} aria-label={words.join(", ")}>
        <span aria-hidden>( {words.join(" · ")} )</span>
      </p>
    );
  }

  return (
    <p className={className} aria-label={words.join(", ")}>
      <span aria-hidden className="relative inline-block">
        ( {words[index]} )
        <span
          ref={blockRef}
          className="absolute -inset-x-[0.05em] -inset-y-[0.08em] origin-left scale-x-0"
          style={{ backgroundColor: REVEAL_BLOCK }}
        />
        <span
          ref={followRef}
          className="absolute -inset-x-[0.05em] -inset-y-[0.08em] origin-left scale-x-0"
          style={{ backgroundColor: REVEAL_HERO }}
        />
      </span>
    </p>
  );
}
