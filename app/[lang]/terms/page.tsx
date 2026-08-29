import { Brand } from "@/components/Brand";
import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("terms", {
  path: routes.terms,
});

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of sale"
      lead="General terms of sale for products and catering services. Delivery fees, minimum orders and lead times are set out under Shipping & returns."
    >
      <LegalSection title="Scope">
        <p>
          These terms apply to online product orders and catering services
          offered by <Brand /> to consumers and professional clients in Belgium,
          unless a separate written agreement applies.
        </p>
      </LegalSection>

      <LegalSection title="Orders & prices">
        <p>
          An order is confirmed once payment is accepted or we confirm the
          catering booking in writing. Prices are shown in euros and include VAT
          unless stated otherwise for B2B quotes.
        </p>
      </LegalSection>

      <LegalSection title="Payment">
        <p>
          Payment methods available at checkout are listed on the site. Catering
          deposits or full prepayment may be required depending on the event.
        </p>
      </LegalSection>

      <LegalSection title="Cancellation">
        <p>
          Any order may be cancelled free of charge up to 24 hours before the
          scheduled delivery date. In that case the full amount of the order is
          refunded.
        </p>
        <p>
          A cancellation made less than 24 hours before delivery cannot, as a
          rule, be refunded, as the products are fresh and prepared specifically
          for each order.
        </p>
        <p>
          Where there is a problem with our service, or products do not match
          the order, please contact us immediately so that an appropriate
          solution can be found.
        </p>
      </LegalSection>

      <LegalSection title="Withdrawal">
        <p>
          For sealed food products and perishable goods, the statutory right of
          withdrawal for distance selling does not generally apply, as provided
          for under Belgian consumer law. The cancellation terms above apply
          instead.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          <Brand /> is not liable for delays or failures caused by events beyond
          our reasonable control. Nothing in these terms limits mandatory
          consumer rights under Belgian law.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
