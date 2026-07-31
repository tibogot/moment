import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "About — Moment",
  description:
    "Moment is a traiteur in Brussels cooking for private hosts and companies.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="About"
        lead="Moment is a traiteur in Brussels. We cook for private hosts and for companies who want the food to say something about them."
      />
      <Footer />
    </>
  );
}
