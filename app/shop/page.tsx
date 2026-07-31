import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Shop — Moment",
  description:
    "Order plates, salads and cold-pressed juices for delivery across Brussels.",
};

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <PageIntro
        title="Shop"
        lead="Plates, salads and cold-pressed juices, prepared each morning and delivered across Brussels. The catalogue lands here once the Shopify storefront is connected."
      />
      <Footer />
    </>
  );
}
