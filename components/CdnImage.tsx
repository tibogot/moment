"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

const SANITY_CDN = "https://cdn.sanity.io/";

/**
 * Sanity's CDN resizes and re-encodes on its own, so a Sanity photograph going
 * through Next's optimiser as well was processed twice: Sanity cut a 1600px
 * version, Vercel downloaded it and cut it again, and every width in the
 * srcset counted against the project's image-optimisation allowance. With this
 * loader each width is asked of Sanity directly — `w`, `q` and `auto=format`
 * on the URL the server already built, which keeps its crop and hotspot.
 */
const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  return url.toString();
};

/**
 * `next/image`, except that Sanity images skip Next's optimiser.
 *
 * A client component because a loader is a function, and a function cannot be
 * handed across from a server component. Everything that is not a Sanity URL —
 * the bundled photographs, Shopify's — renders exactly as `next/image` would.
 */
export function CdnImage(props: ImageProps) {
  const isSanity =
    typeof props.src === "string" && props.src.startsWith(SANITY_CDN);

  // `alt` arrives in props; the lint rule cannot see through the spread.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={isSanity ? sanityLoader : props.loader} />;
}
