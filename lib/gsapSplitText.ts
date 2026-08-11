"use client";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

/*
 * Only TextReveal splits text. Kept out of lib/gsapConfig for the same reason
 * as Flip — the layout chunk should carry what the layout uses. See the note
 * there.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export { SplitText };
