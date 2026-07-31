import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Coffee — Moment",
  description:
    "The Moment coffee desk in Brussels — coffee, pastries and cold-pressed juices.",
};

export default function CoffeePage() {
  return (
    <>
      <SiteHeader />
      <PageIntro
        title="Coffee"
        lead="A coffee desk for anyone passing by, serving the same pastries and juices we send out to our clients."
      />
      <Footer />
    </>
  );
}
