import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Turns on `app/global-not-found.tsx`.
     *
     * The docs name this exact situation: a global 404 cannot be composed from
     * `layout.js` + `not-found.js` when "your root layout is defined using
     * top-level dynamic segments", which is `app/[lang]/layout.tsx` here. A
     * `not-found.tsx` beside that layout is compiled as the global
     * `/_not-found` route and rendered outside the layout entirely — so it
     * never saw the LocaleProvider, and never rendered at all.
     */
    globalNotFound: true,
  },

  images: {
    // AVIF first: roughly 30% smaller than WebP on photographs. Browsers that
    // don't support it fall back to WebP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
