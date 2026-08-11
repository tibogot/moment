import type { Metadata } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import { NotFoundScreen } from "@/components/NotFoundScreen";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  archivoLight,
  archivoLightItalic,
  ownersMedium,
  ownersNarrowBold,
} from "./fonts";
import "./globals.css";

/**
 * The 404 for a URL that matches no route at all.
 *
 * `not-found.tsx` cannot do this job here. The docs name the case: a global 404
 * cannot be composed from a layout and a not-found when the root layout sits
 * under a top-level dynamic segment, which is exactly `app/[lang]/layout.tsx`.
 * A `not-found.tsx` beside it is compiled as the global route and rendered
 * outside that layout — which is why the designed 404 in this repo had never
 * once appeared, for any URL, before this file existed.
 *
 * Next skips normal rendering for this page, so it returns the whole document
 * and imports the stylesheet and fonts the root layout would have supplied.
 *
 * It answers in the default language. There is no locale to read — an unmatched
 * URL may carry no valid prefix at all — and negotiating one from a header
 * would make every 404 dynamic.
 */
export const metadata: Metadata = {
  title: "404",
};

export default async function GlobalNotFound() {
  const dictionary = await getDictionary(DEFAULT_LOCALE);

  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${ownersMedium.variable} ${ownersNarrowBold.variable} ${archivoLight.variable} ${archivoLightItalic.variable} h-full antialiased`}
    >
      <body className="min-h-svh flex flex-col">
        {/* The screen takes its copy as a prop, but the footer and the
            locale-aware links inside it still expect the provider the root
            layout would normally have supplied. */}
        <LocaleProvider locale={DEFAULT_LOCALE} dictionary={dictionary}>
          <NotFoundScreen copy={dictionary.common.notFound} />
        </LocaleProvider>
      </body>
    </html>
  );
}
