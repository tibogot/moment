import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Contact — Moment",
  description: "Get in touch with Moment — traiteur in Brussels.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Contact"
        lead="Tell us the date, the number of people and roughly what you have in mind. We will come back with a menu and a price."
      />
      <Footer />
    </>
  );
}
