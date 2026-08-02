import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, graph, organizationSchema } from "@/lib/schema";
import { absoluteUrl, fullTitle, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Request a quote from Moment, traiteur in Brussels. Tell us the date, the number of people and what you have in mind — we come back with a menu and a price.",
  path: routes.contact,
  keywords: ["traiteur Brussels contact", "catering quote Brussels"],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "ContactPage",
            url: absoluteUrl(routes.contact),
            name: fullTitle("Contact"),
            about: organizationSchema(),
          },
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: "Contact", path: routes.contact },
          ]),
        )}
      />

      <PageIntro
        title="Contact"
        lead="Tell us the date, the number of people and roughly what you have in mind. We will come back with a menu and a price."
      />

      <ContactForm />

      <Footer />
    </>
  );
}
