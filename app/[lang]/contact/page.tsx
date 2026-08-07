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
import { toLocale } from "@/lib/i18n/config";
import {
  getDictionary,
  interpolate,
  type Dictionary,
} from "@/lib/i18n/dictionaries";
import { menuEnquiryMessage } from "@/lib/menus";
import { routes } from "@/lib/routes";
import { getMenuBySlug } from "@/lib/sanity/queries";
import { breadcrumbSchema, graph, organizationSchema } from "@/lib/schema";
import { absoluteUrl, fullTitle, localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("contact", {
  path: routes.contact,
});

type ContactPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    menu?: string;
    occasion?: string;
    address?: string;
    km?: string;
  }>;
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
  dict: Dictionary,
): Promise<ContactValues> {
  const { menu: menuSlug, occasion, address, km } = await searchParams;

  const values: ContactValues = { ...EMPTY_CONTACT_VALUES };

  // Sent here by the address panel when a delivery falls outside the zones it
  // can price. The distance is re-parsed rather than trusted: it arrives in a
  // URL the customer can edit, and it is about to be written into an email.
  if (address) {
    const distance = Number(km);
    values.occasion = "Delivery";
    values.message = interpolate(dict.quote.message, {
      address,
      km: Number.isFinite(distance) ? Math.round(distance) : "?",
    });
  }

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

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(toLocale(lang));
  const initialValues = await resolvePrefill(searchParams, dict);

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

      <ContactForm initialValues={initialValues} />

      <Footer />
    </>
  );
}
