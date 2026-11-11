import type { MetadataRoute } from "next";
import { siteConfig, siteIsIndexable } from "@/lib/site";

/**
 * The cart, account and sign-in pages are *not* disallowed: they carry
 * `robots: { index: false }`, and a crawler has to be allowed to fetch a page
 * to read that. Disallowed, an externally linked /fr/cart could still be
 * indexed as a bare URL — the one thing the noindex is there to prevent.
 *
 * Until the real domain exists the whole site is closed instead. See
 * `siteIsIndexable`: a `.vercel.app` address indexed now would have to be
 * un-indexed later, and every result would point at somewhere the business no
 * longer is. No sitemap is advertised either — there is nothing here we want
 * fetched, and pointing a crawler at a file that lists a hundred URLs is the
 * opposite of a disallow rule.
 */
export default function robots(): MetadataRoute.Robots {
  if (!siteIsIndexable) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        // Not for secrecy — the Studio asks for a Sanity login on its own. This
        // is so a CMS sign-in screen never turns up in the results for the
        // client's own name.
        "/studio",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
