"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

const SANITY_CDN = "https://cdn.sanity.io/";
const SHOPIFY_CDN = "https://cdn.shopify.com/";

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
 * The same for Shopify's CDN, which resizes on `width` and already serves WebP
 * or AVIF to browsers that ask. Product photographs were the bulk of the
 * optimiser's work — every card, gallery and cart line, in every width of the
 * srcset — and all of it was work Shopify does for free.
 */
const shopifyLoader: ImageLoader = ({ src, width }) => {
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
};

/**
 * `next/image`, except that Sanity and Shopify images skip Next's optimiser.
 *
 * A client component because a loader is a function, and a function cannot be
 * handed across from a server component. Everything else — the bundled
 * photographs — renders exactly as `next/image` would.
 */
export function CdnImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const loader = src.startsWith(SANITY_CDN)
    ? sanityLoader
    : src.startsWith(SHOPIFY_CDN)
      ? shopifyLoader
      : props.loader;

  // `alt` arrives in props; the lint rule cannot see through the spread.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={loader} />;
}
