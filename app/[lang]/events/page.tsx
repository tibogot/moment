import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("events", {
  path: routes.events,
});

export default function EventsPage() {
  return (
    <>
      <PageIntro
        title="Events"
        lead="From a twenty-person launch to a seated dinner. We handle the menu, the service and everything that has to happen before the doors open."
      />
      <Footer />
    </>
  );
}
