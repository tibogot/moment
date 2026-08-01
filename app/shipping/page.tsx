import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Shipping & returns — Moment",
  description: "Delivery, pickup and return information for Moment orders.",
};

export default function ShippingPage() {
  return (
    <LegalDoc
      title="Shipping & returns"
      lead="How delivery and returns work for Moment. Draft — final zones, lead times and return rules will be confirmed with operations."
    >
      <LegalSection title="Delivery area">
        <p>
          We deliver across Brussels and surrounding areas. Exact coverage and
          cut-off times are confirmed at checkout or when you request catering.
        </p>
      </LegalSection>

      <LegalSection title="Lead times">
        <p>
          Product delivery typically needs at least two days&apos; notice.
          Sundays are closed. Catering timelines depend on the event size and
          menu.
        </p>
      </LegalSection>

      <LegalSection title="Returns">
        <p>
          Because many items are fresh or perishable, returns are limited.
          Damaged or incorrect orders should be reported as soon as possible
          after delivery so we can replace or refund where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="Pickup">
        <p>
          Pickup from the coffee desk may be available for selected products.
          Options will be shown at checkout when offered.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
