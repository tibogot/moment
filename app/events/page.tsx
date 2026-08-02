import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Event Catering in Brussels",
  description:
    "Full-service catering for launches, receptions and seated dinners in Brussels — menu, staff and service handled from first call to last plate.",
  path: routes.events,
  keywords: [
    "event catering Brussels",
    "reception catering Brussels",
    "corporate event catering Brussels",
    "wedding catering Brussels",
  ],
});

export default function EventsPage() {
  return (
    <>
      <PageIntro
        title="Events"
        lead="From a twenty-person launch to a seated dinner. We handle the menu, the service and everything that has to happen before the doors open."
        leadClassName="text-[18px] md:text-[18px]"
      />
      <Footer />
    </>
  );
}
