import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Coffee Desk",
  description:
    "The Moment coffee desk in Brussels — filter and espresso, pastries out of our own kitchen, and cold-pressed juices to take away.",
  path: routes.coffee,
  keywords: ["coffee Brussels", "coffee desk Brussels", "pastries Brussels"],
});

export default function CoffeePage() {
  return (
    <>
      <PageIntro
        title="Coffee"
        lead="A coffee desk for anyone passing by, serving the same pastries and juices we send out to our clients."
      />
      <Footer />
    </>
  );
}
