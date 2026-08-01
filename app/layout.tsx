import type { Metadata } from "next";
import ScrollToTop from "@/components/ScrollToTop";
import { Navbar } from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import {
  archivoLight,
  archivoLightItalic,
  ownersMedium,
  ownersNarrowBold,
} from "./fonts";
import "./globals.css";

const REVEAL_GUARD = `(function(){try{document.documentElement.classList.add("reveal-js")}catch(e){}})()`;

export const metadata: Metadata = {
  title: "Moment",
  description: "Moment — coffee, events, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      </head>
      <body className="min-h-svh flex flex-col">
        <SmoothScroll>
          <ScrollToTop />
          <Navbar />
          <div className="relative flex flex-1 flex-col">{children}</div>
        </SmoothScroll>
      </body>
    </html>
  );
}
