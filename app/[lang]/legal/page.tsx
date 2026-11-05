import { Brand } from "@/components/Brand";
import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { routes } from "@/lib/routes";
import { LEGAL_CONTENT_LOCALE, localizedMetadata } from "@/lib/seo";
import { SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("legal", {
  path: routes.legal,
  contentLocale: LEGAL_CONTENT_LOCALE,
});

export default function LegalPage() {
  const { contact, legal } = SITE_DETAILS;

  return (
    <LegalDoc
      title="Legal notice"
      lead="Company identity required under Belgian law."
    >
      <LegalSection title="Publisher">
        <p>
          <Brand name={legal.companyName} />
          {legal.legalForm ? ` (${legal.legalForm})` : ""}
        </p>
        {contact.street && <p>{contact.street}</p>}
        <p>
          {[contact.postalCode, contact.city].filter(Boolean).join(" ")},{" "}
          {contact.country}
        </p>
        {contact.email && <p>{contact.email}</p>}
        {contact.phone && <p>{contact.phone}</p>}
      </LegalSection>

      <LegalSection title="Enterprise & VAT">
        <p>
          BCE / enterprise number:{" "}
          {legal.enterpriseNumber || "[to be completed]"}
        </p>
        <p>VAT number: {legal.vatNumber || "[to be completed]"}</p>
      </LegalSection>

      <LegalSection title="Hosting">
        <p>
          This website is hosted by the provider configured for the Moment
          production environment. Hosting details will be listed here before
          launch.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          All content on this site — text, images, logos and design — is owned
          by <Brand /> or its partners and may not be reused without prior
          written permission.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
