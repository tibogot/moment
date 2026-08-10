import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { siteConfig, siteIsIndexable } from "@/lib/site";

/**
 * The disallow list is the crawl-budget half of the job — the same routes also
 * carry `robots: { index: false }` in their metadata, which is what actually
 * keeps them out of the index if a crawler reaches them by another path.
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
        routes.cart,
        routes.account,
        routes.signIn,
        // Not for secrecy — the Studio asks for a Sanity login on its own. This
        // is so a CMS sign-in screen never turns up in the results for the
        // client's own name.
        "/studio",
        "/testtextreveal",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
