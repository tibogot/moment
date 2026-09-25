import localFont from "next/font/local";

export const ownersMedium = localFont({
  src: "./fonts/Owners_Medium.otf",
  variable: "--font-face-owners-medium",
  display: "swap",
});

export const ownersNarrowBold = localFont({
  src: "./fonts/Owners_Narrow_Bold.otf",
  variable: "--font-face-owners-narrow-bold",
  display: "swap",
});

/*
 * Archivo ships as woff2, converted from the TTFs: a quarter of the size, and
 * the Open Font License it carries allows the format change. Owners stays OTF
 * until its licence is checked — a commercial font's EULA can forbid
 * converting it, and that is not ours to decide.
 */
export const archivoLight = localFont({
  src: "./fonts/Archivo_Condensed-Light.woff2",
  variable: "--font-face-archivo-light",
  display: "swap",
});

/**
 * Only article quotes and emphasis use it, so it is not preloaded: every page
 * was fetching 130 KB of a face almost none of them draws.
 */
export const archivoLightItalic = localFont({
  src: "./fonts/Archivo_Condensed-LightItalic.woff2",
  variable: "--font-face-archivo-light-italic",
  display: "swap",
  preload: false,
});
