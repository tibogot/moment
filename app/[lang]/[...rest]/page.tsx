import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Any path under a language that matches no page.
 *
 * Without it, /fr/whatever matched no route and fell through to
 * `app/global-not-found.tsx`, which renders outside the locale layout: no
 * navbar, and always in French. Caught here instead, `notFound()` raises the
 * locale boundary (`app/[lang]/not-found.tsx`) inside the layout, so the 404
 * keeps the navbar and the visitor's language. The global 404 is left for URLs
 * with no valid language at all.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { common } = await getDictionary(isLocale(lang) ? lang : DEFAULT_LOCALE);
  return {
    title: common.notFound.title,
    robots: { index: false, follow: true },
  };
}

export default function CatchAll() {
  notFound();
}
