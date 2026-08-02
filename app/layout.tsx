import type { Metadata, Viewport } from "next";
import ScrollToTop from "@/components/ScrollToTop";
import { ConsentScripts } from "@/components/ConsentScripts";
import { CookieConsent } from "@/components/CookieConsent";
import { PaletteToggle } from "@/components/PaletteToggle";
import { Navbar } from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import { getProducts } from "@/lib/shopify/products";
import { getCollections } from "@/lib/shopify/collections";
import { OG_LOCALE } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import {
  archivoLight,
  archivoLightItalic,
  ownersMedium,
  ownersNarrowBold,
} from "./fonts";
import "./globals.css";

const REVEAL_GUARD = `(function(){try{document.documentElement.classList.add("reveal-js")}catch(e){}})()`;
const PALETTE_GUARD = `(function(){try{var p=localStorage.getItem("moment-palette");if(p==="sky")document.documentElement.dataset.palette="sky"}catch(e){}})()`;

const HOME_TITLE = `${siteConfig.name} — Traiteur & Catering in Brussels`;

/**
 * Site-wide defaults. Pages override the parts they care about through
 * `pageMetadata` in lib/seo.ts; anything they leave alone falls through to
 * here, so a new route is never shipped without an Open Graph card.
 */
export const metadata: Metadata = {
  // Lets pages declare canonical and Open Graph URLs as plain route paths.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: HOME_TITLE,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.legal.companyName || siteConfig.name,
  category: "food",
  // Safari turns anything that resembles a phone number into a call link,
  // which mangles prices and order numbers.
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: HOME_TITLE,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: OG_LOCALE,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-size images and untruncated snippets — the default
      // caps both, which costs us the visual slot on recipe/menu queries.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f7f2",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);
  const navCollections = collections.filter(
    (collection) => collection.handle !== "frontpage",
  );

  return (
    <html
      lang="en"
      className={`${ownersMedium.variable} ${ownersNarrowBold.variable} ${archivoLight.variable} ${archivoLightItalic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs synchronously while the browser parses the HTML — before the
            first paint and before React hydrates — so TextReveal targets are
            hidden without ever flashing. If JS is off or this fails, the class
            is never set and the copy simply stays visible. */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_GUARD }} />
        <script dangerouslySetInnerHTML={{ __html: PALETTE_GUARD }} />
      </head>
      <body className="min-h-svh flex flex-col">
        <SmoothScroll>
          <ScrollToTop />
          <Navbar products={products} collections={navCollections} />
          <div className="relative flex flex-1 flex-col">{children}</div>
          <CookieConsent />
          <ConsentScripts />
          <PaletteToggle />
        </SmoothScroll>
      </body>
    </html>
  );
}
