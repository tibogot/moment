import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const generateMetadata = localizedMetadata({
  title: "Terms of sale",
  description:
    "General terms of sale (CGV) for Moment product orders and catering services in Belgium.",
  path: routes.terms,
});

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of sale"
      lead="General terms of sale for products and catering services. Draft — to be aligned with Belgian consumer and distance-selling rules before launch."
    >
      <LegalSection title="Scope">
        <p>
          These terms apply to online product orders and catering services
          offered by {siteConfig.name} to consumers and professional clients in
          Belgium, unless a separate written agreement applies.
        </p>
      </LegalSection>

      <LegalSection title="Orders & prices">
        <p>
          An order is confirmed once payment is accepted or we confirm the
          catering booking in writing. Prices are shown in euros and include
          VAT unless stated otherwise for B2B quotes.
        </p>
      </LegalSection>

      <LegalSection title="Payment">
        <p>
          Payment methods available at checkout are listed on the site.
          Catering deposits or full prepayment may be required depending on the
          event.
        </p>
      </LegalSection>

      <LegalSection title="Withdrawal">
        <p>
          For sealed food products and perishable goods, the legal right of
          withdrawal may not apply once delivery constraints or hygiene rules
          are engaged. Specific rules for catering cancellations will be set
          out here.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          {siteConfig.name} is not liable for delays or failures caused by
          events beyond our reasonable control. Nothing in these terms limits
          mandatory consumer rights under Belgian law.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
