import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { PageIntroContent } from "@/components/v2/PageIntroGrid";
import { PhotoGridSection } from "@/components/v2/PhotoGridSection";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCoffeePageImages } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

/** The Studio's photo for a slot, or the built-in one while it is empty. */
function photo(image: SanityImage | null, fallback: string) {
  return image ? urlFor(image).width(1600).auto("format").url() : fallback;
}

export const generateMetadata = localizedMetadata("coffee", {
  path: routes.coffee,
});

/**
 * The coffee counter (27 November 2026). Not a café people walk into, as the
 * site first said: the owners bring the counter, a barista and their
 * equipment to an event. Their text, two photos from the Studio and a booking
 * form, on the same layout as /events.
 */
export default async function CoffeePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [dict, images, availability] = await Promise.all([
    getDictionary(toLocale((await params).lang)),
    getCoffeePageImages(),
    getDeliveryAvailability(),
  ]);

  return (
    <>
      <div className="v2">
        {/* Two photographs staggered, each as many rows as columns so both
            are 3/4 portraits, on the page grid (16 / 12 / 4 cells, like the
            home and the FAQ). Cells, columns · rows:
              mobile 4 × 8     1–4 · 1–4       2–4 · 5–7
              tablet 12 × 12   1–6 · 1–6       7–12 · 5–10
              desktop 16 × 14  1–8 · 1–8       11–16 · 7–12 */}
        {/* One section: title and lead, then the photographs in the cells,
            a single rule between them. */}
        <PhotoGridSection
          header={
            <PageIntroContent
              title={dict.pageIntro.coffee.title}
              lead={dict.pageIntro.coffee.lead}
            />
          }
          rowsClassName="[--rows:8] md:[--rows:12] lg:[--rows:14]"
          photos={[
            {
              // The owners' counter, from Studio → Page Comptoir café.
              src: photo(images.first, "/images/moment-coffee-counter.jpg"),
              alt: "",
              className:
                "col-[2/span_4] row-[1/span_4] md:col-[2/span_6] md:row-[1/span_6] lg:col-[2/span_8] lg:row-[1/span_8]",
            },
            {
              src: photo(images.second, "/images/dan-smedley.jpg"),
              alt: "",
              className:
                "col-[3/span_3] row-[5/span_3] md:col-[8/span_6] md:row-[5/span_6] lg:col-[12/span_6] lg:row-[7/span_6]",
            },
          ]}
        />
      </div>

      {/* The booking form the owners asked for (27 November 2026): private or
          professional, date, guests, place, service hours. */}
      <ContactForm variant="coffee" leadTimeDays={availability.leadTimeDays} />

      <Footer />
    </>
  );
}
