import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

/**
 * The disallow list is the crawl-budget half of the job — the same routes also
 * carry `robots: { index: false }` in their metadata, which is what actually
 * keeps them out of the index if a crawler reaches them by another path.
 */
export default function robots(): MetadataRoute.Robots {
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
