import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Events — Moment",
  description:
    "Full-service catering for launches, receptions and seated dinners in Brussels.",
};

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
