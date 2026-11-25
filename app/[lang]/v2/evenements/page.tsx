import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { GridOverlayToggle } from "@/components/v2/GridOverlayToggle";
import { SystemSplit } from "@/components/v2/SystemSections";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import heroImage from "@/public/images/onur-kaya.jpg";

/**
 * Test bench: the Événements page on the 16 / 12 / 4 grid of /v2/systeme.
 * Not linked, not indexed. The live page is app/[lang]/events.
 *
 * The hero is the half-text, half-image section of /v2/systeme: the
 * photograph on the right half, the title and the page's lead bottom-left.
 * What comes under it waits for Moment's answer: corporate events only or
 * private too, and two or three past events with photographs.
 */
export const metadata: Metadata = {
  title: "v2 — événements",
  robots: { index: false, follow: false },
};

export default async function EventsV2({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const dict = await getDictionary(toLocale((await params).lang));

  return (
    <>
      <div className="v2">
        <SystemSplit
          hero
          title={dict.pageIntro.events.title}
          lead={dict.pageIntro.events.lead}
          image={heroImage}
        />
      </div>
      <Footer />
      <GridOverlayToggle />
    </>
  );
}
