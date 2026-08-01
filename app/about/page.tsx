import type { Metadata } from "next";
import { AboutHero } from "@/components/AboutHero";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — Moment",
  description:
    "Moment is a traiteur in Brussels cooking for private hosts and companies.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Footer />
    </>
  );
}
