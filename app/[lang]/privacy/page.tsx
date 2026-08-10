import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getSiteDetails } from "@/lib/sanity/queries";
import { siteConfig } from "@/lib/site";

export const generateMetadata = localizedMetadata("privacy", {
  path: routes.privacy,
});

export default async function PrivacyPage() {
  const { contact, legal } = await getSiteDetails();

  return (
    <LegalDoc
      title="Privacy"
      lead="How Moment collects, uses and protects personal data under the GDPR and Belgian law. Draft copy — to be reviewed before launch."
    >
      <LegalSection title="Who we are">
        <p>
          The data controller is {legal.companyName || siteConfig.name}, based
          in {contact.city}, {contact.country}.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>
          We may process identity and contact details, order and delivery
          information, account data, payment references (handled by our payment
          provider), and technical data such as device and browsing information
          when you use the site.
        </p>
      </LegalSection>

      <LegalSection title="Why we use it">
        <p>
          To fulfil orders and catering requests, manage your account, answer
          enquiries, improve the site, meet legal obligations, and — only where
          allowed — send marketing communications.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You may request access, correction, deletion, restriction or
          portability of your data, and object to certain processing. You may
          also lodge a complaint with the Belgian Data Protection Authority
          (Autorité de protection des données / Gegevensbeschermingsautoriteit).
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For privacy requests, contact us via the Contact page. A dedicated
          privacy email will be added here once confirmed.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
