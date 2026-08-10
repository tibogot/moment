import type { Metadata, Viewport } from "next";
import { Studio } from "./Studio";

/**
 * The Sanity Studio, served from this app rather than a separate deployment.
 *
 * The URL is public; the content is not. Without a Sanity session this renders
 * a login screen, and what a logged-in editor can see is decided by the project
 * members list on sanity.io/manage — not by anything in this repo. Mounting it
 * here rather than on `*.sanity.studio` changes the address and nothing else
 * about who gets in.
 *
 * The optional catch-all is required: the Studio owns its own routing below
 * /studio, and a plain `page.tsx` would 404 on every tool and document it
 * navigates to.
 *
 * It sits outside `app/[lang]` deliberately — the Studio has its own language
 * handling and none of this site's copy — which is why `proxy.ts` skips it. Its
 * absence there is not a tidy-up: with the prefix in front, nothing ever mounts.
 */
export const dynamic = "force-static";

/**
 * Spelled out rather than re-exported from `next-sanity/studio`, which would put
 * the Studio's own module graph back in front of this Server Component — the
 * thing `Studio.tsx` exists to avoid. These are that package's defaults.
 *
 * `noindex` is the belt to robots.txt's braces: the disallow rule asks crawlers
 * not to look, this tells the ones that arrive by another route not to list it.
 */
export const metadata: Metadata = {
  referrer: "same-origin",
  robots: "noindex",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function StudioPage() {
  return <Studio />;
}
