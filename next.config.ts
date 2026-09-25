import type { NextConfig } from "next";

/**
 * The baseline every response carries.
 *
 * Deliberately not a full Content-Security-Policy. A script policy worth having
 * needs a per-request nonce, and in Next a nonce makes every page render on
 * request — the whole site loses its static HTML to guard against an injection
 * nobody has found. `frame-ancestors` is the part that pays for itself: it stops
 * another site framing the cart or the Studio under a fake page and steering
 * the clicks (clickjacking). X-Frame-Options says the same to older browsers.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },

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
