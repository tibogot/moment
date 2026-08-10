import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { EMPTY_CONTACT_VALUES, PRO_OCCASION } from "@/lib/contact";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

export const generateMetadata = localizedMetadata("pro", {
  path: routes.proAccount,
});

/**
 * The application for a professional account.
 *
 * It is an enquiry, not a signup: the form reaches the kitchen's inbox, someone
 * reads it, and the customer is tagged `pro` in the Shopify admin by hand. That
 * is deliberate for now — until the client says who approves these and how
 * quickly, an automatic account would be promising something nobody has agreed
 * to staff.
 *
 * There is no separate login. Once approved, a company signs in through the
 * same Shopify OAuth as everyone else and the tag decides what their account
 * shows them.
 */
export default async function ProAccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [dict, availability] = await Promise.all([
    getDictionary(toLocale(lang)),
    getDeliveryAvailability(),
  ]);

  return (
    <>
      <PageIntro title={dict.proAccount.title} lead={dict.proAccount.lead} />

      <ContactForm
        variant="pro"
        initialValues={{ ...EMPTY_CONTACT_VALUES, occasion: PRO_OCCASION }}
        leadTimeDays={availability.leadTimeDays}
      />

      <Footer />
    </>
  );
}
