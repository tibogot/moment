import localFont from "next/font/local";

export const ownersMedium = localFont({
  src: "./fonts/Owners_Medium.woff2",
  variable: "--font-face-owners-medium",
  display: "swap",
});

export const ownersNarrowBold = localFont({
  src: "./fonts/Owners_Narrow_Bold.woff2",
  variable: "--font-face-owners-narrow-bold",
  display: "swap",
});

/*
 * Every face ships as woff2, converted from the desktop files at well under
 * half the size. Archivo's Open Font License allows the format change, and the
 * client confirmed Owners' licence does too.
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
