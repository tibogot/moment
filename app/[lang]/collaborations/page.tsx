import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

export const generateMetadata = localizedMetadata("collaborations", {
  path: routes.collaborations,
});

/**
 * For venues that want to stock Moment products — the owners' "Collaborations"
 * tab of 3 November 2026, with their own introduction as the lead.
 *
 * Deliberately its own page rather than a tab of /pro. The two audiences do
 * not overlap: /pro is a company opening an account to order catering for its
 * staff, this is a café or a deli asking to resell. Different questions,
 * different follow-up, and a visitor should never have to work out which half
 * of a shared form is theirs. Same pipeline underneath — the request lands in
 * the same inbox, with its kind in the subject line.
 */
export default async function CollaborationsPage({
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
      <PageIntro title={dict.partner.title} lead={dict.partner.lead} />

      <ContactForm variant="partner" leadTimeDays={availability.leadTimeDays} />

      <Footer />
    </>
  );
}
