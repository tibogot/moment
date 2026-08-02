import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import {
  EMPTY_CONTACT_VALUES,
  OCCASIONS,
  type ContactValues,
  type Occasion,
} from "@/lib/contact";
import { menuEnquiryMessage } from "@/lib/menus";
import { routes } from "@/lib/routes";
import { getMenuBySlug } from "@/lib/sanity/queries";
import { breadcrumbSchema, graph, organizationSchema } from "@/lib/schema";
import { absoluteUrl, fullTitle, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Request a quote from Moment, traiteur in Brussels. Tell us the date, the number of people and what you have in mind — we come back with a menu and a price.",
  path: routes.contact,
  keywords: ["traiteur Brussels contact", "catering quote Brussels"],
});

type ContactPageProps = {
  searchParams: Promise<{ menu?: string; occasion?: string }>;
};

/**
 * Reads `?menu=` and `?occasion=` so the menu pages can hand the form its
 * context. Both are resolved here rather than in the client component: the
 * boxes then arrive prefilled in the server-rendered HTML, with no empty first
 * paint and no Suspense boundary around the form.
 *
 * Touching searchParams opts this route out of static rendering. That is the
 * intended trade — it is a form, not a document, and the Sanity read only
 * happens when a menu is actually named.
 */
async function resolvePrefill(
  searchParams: ContactPageProps["searchParams"],
): Promise<ContactValues> {
  const { menu: menuSlug, occasion } = await searchParams;

  const values: ContactValues = { ...EMPTY_CONTACT_VALUES };

  if (menuSlug) {
    const menu = await getMenuBySlug(menuSlug);
    if (menu) {
      values.occasion = "Event";
      values.message = menuEnquiryMessage(menu);
    }
  }

  // Checked against the list rather than trusted: the value is rendered into a
  // radio group and mailed as the subject line.
  if (OCCASIONS.includes(occasion as Occasion)) {
    values.occasion = occasion as Occasion;
  }

  return values;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const initialValues = await resolvePrefill(searchParams);

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
        leadClassName="text-[18px] md:text-[18px]"
      />

      <ContactForm initialValues={initialValues} />

      <Footer />
    </>
  );
}
