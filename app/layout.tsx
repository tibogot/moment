import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import {
  archivoLight,
  archivoLightItalic,
  ownersMedium,
  ownersNarrowBold,
} from "./fonts";
import "./globals.css";

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
    >
      <body className="min-h-svh flex flex-col">
        <SmoothScroll>
          <div className="relative flex flex-1 flex-col">{children}</div>
        </SmoothScroll>
      </body>
    </html>
  );
}
