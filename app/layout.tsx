import type { Metadata } from "next";
import ScrollToTop from "@/components/ScrollToTop";
import { ConsentScripts } from "@/components/ConsentScripts";
import { CookieConsent } from "@/components/CookieConsent";
import { PaletteToggle } from "@/components/PaletteToggle";
import { Navbar } from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import { getProducts } from "@/lib/shopify/products";
import { getCollections } from "@/lib/shopify/collections";
import {
  archivoLight,
  archivoLightItalic,
  ownersMedium,
  ownersNarrowBold,
} from "./fonts";
import "./globals.css";

const REVEAL_GUARD = `(function(){try{document.documentElement.classList.add("reveal-js")}catch(e){}})()`;
const PALETTE_GUARD = `(function(){try{var p=localStorage.getItem("moment-palette");if(p==="sky")document.documentElement.dataset.palette="sky"}catch(e){}})()`;

export const metadata: Metadata = {
  title: "Moment",
  description: "Moment — coffee, events, and more.",
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
