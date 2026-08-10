import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getSiteDetails } from "@/lib/sanity/queries";
import { siteConfig } from "@/lib/site";

export const generateMetadata = localizedMetadata("legal", {
  path: routes.legal,
});

export default async function LegalPage() {
  const { contact, legal } = await getSiteDetails();

  return (
    <LegalDoc
      title="Legal notice"
      lead="Company identity required under Belgian law. Details below are placeholders until the final company information is confirmed."
    >
      <LegalSection title="Publisher">
        <p>
          {legal.companyName || siteConfig.name}
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
          by {siteConfig.name} or its partners and may not be reused without
          prior written permission.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
