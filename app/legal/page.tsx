import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal notice — Moment",
  description: "Legal notice and company information for Moment.",
};

export default function LegalPage() {
  return (
    <LegalDoc
      title="Legal notice"
      lead="Company identity required under Belgian law. Details below are placeholders until the final company information is confirmed."
    >
      <LegalSection title="Publisher">
        <p>
          {siteConfig.legal.companyName || siteConfig.name}
          {siteConfig.legal.legalForm
            ? ` (${siteConfig.legal.legalForm})`
            : ""}
        </p>
        <p>
          {siteConfig.contact.city}, {siteConfig.contact.country}
        </p>
        {siteConfig.contact.email && <p>{siteConfig.contact.email}</p>}
        {siteConfig.contact.phone && <p>{siteConfig.contact.phone}</p>}
      </LegalSection>

      <LegalSection title="Enterprise & VAT">
        <p>
          BCE / enterprise number:{" "}
          {siteConfig.legal.enterpriseNumber || "[to be completed]"}
        </p>
        <p>
          VAT number: {siteConfig.legal.vatNumber || "[to be completed]"}
        </p>
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
