import type { Metadata } from "next";
import { CalendarCells } from "@/components/v2/CalendarCells";
import { FooterCells } from "@/components/v2/FooterCells";
import { GridOverlayToggle } from "@/components/v2/GridOverlayToggle";
import {
  SystemHero,
  SystemHeroCentred,
  SystemSplit,
  SystemSteps,
} from "@/components/v2/SystemSections";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";
import eventsImage from "@/public/images/onur-kaya.jpg";

/**
 * Test bench: one grid from the hero to the footer (see SystemSections).
 * Not linked, not indexed.
 */
export const metadata: Metadata = {
  title: "v2 — système",
  robots: { index: false, follow: false },
};

export default async function SystemV2({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [dict, availability] = await Promise.all([
    getDictionary(toLocale(lang)),
    getDeliveryAvailability(),
  ]);

  return (
    <>
      <div className="v2">
        {/* The hero not locked to 100svh: the logo centred on the first
            screen, the grid running past the fold. */}
        <SystemHeroCentred />
        {/* The 100svh version, to compare. */}
        <SystemHero services={dict.home.hero.services} />
        <SystemSplit
          title={dict.home.panels.events.title}
          lead={dict.home.panels.events.lead}
          image={eventsImage}
        />
        {/* The same, title only, on one row, the grid closed around it. */}
        <SystemSplit
          title={dict.home.panels.events.title}
          image={eventsImage}
        />
        <SystemSteps title={dict.faq.stepsTitle} steps={dict.faq.steps} />
        {/* The delivery calendar, every day a cell of the grid. */}
        <CalendarCells availability={availability} />
        <FooterCells />
      </div>
      <GridOverlayToggle />
    </>
  );
}
