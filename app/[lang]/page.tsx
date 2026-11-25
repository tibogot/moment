import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { CalendarCells } from "@/components/v2/CalendarCells";
import { GridSpacer } from "@/components/v2/GridSpacer";
import { IntroCells } from "@/components/v2/IntroCells";
import { OfferCards } from "@/components/v2/OfferCards";
import { PhotoHero } from "@/components/v2/PhotoHero";
import { ProductCarouselCells } from "@/components/v2/ProductCarouselCells";
import { StoryCells } from "@/components/v2/StoryCells";
import {
  DEFAULT_LOCALE,
  isLocale,
  toLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { siteGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { SITE_DETAILS } from "@/lib/site";
import { urlFor } from "@/lib/sanity/image";
import { pick, type LocaleString } from "@/lib/sanity/locale";
import { getHomePageImages } from "@/lib/sanity/queries";
import type { SanityImage } from "@/lib/sanity/types";
import { getCollectionByHandle } from "@/lib/shopify/collections";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";
// Built-in photographs: each one shows until the owners upload theirs in the
// Studio (Page d'accueil).
import companiesImage from "@/public/images/anita-austvika.jpg";
import heroImage from "@/public/images/maximilian-brol-2WgI7YN7C5A-unsplash.jpg";
import coffeeImage from "@/public/images/oak-bond-coffee.jpg";
import eventsImage from "@/public/images/onur-kaya.jpg";
import kitchenImage from "@/public/images/dan-smedley.jpg";
import deliveryImage from "@/public/images/william-king.jpg";
import hostingImage from "@/public/images/nicole-herrero.jpg";

/**
 * The home, on the v2 grid since 25 November 2026 (the previous one is at
 * /v1 until every section has moved): the photo hero, the intro (the page's
 * h1), the carousel of the moments of the day, the three beats (la cuisine,
 * la livraison, la table), the three services, the delivery calendar.
 *
 * The carousel's tabs are the brief's own moments — "un lunch entre
 * collègues, un brunch qui s'étire, un café qu'on prend enfin le temps de
 * boire" — rather than occasions (events / home / office): nearly every
 * product is tagged for all three occasions, so those tabs showed the same
 * list three times. What changes with the occasion is the service, so the
 * occasions became the three cards under the carousel.
 */
/**
 * The home page keeps an absolute title rather than the "%s — Moment"
 * template: it's the one page where the brand name leads. That is also why it
 * declares metadata by hand instead of going through `localizedMetadata`,
 * which would apply the template.
 *
 * It still has to resolve its own alternates: a static `alternates` here
 * replaces the layout's rather than merging with it, which is how all three
 * home pages ended up canonicalising to the bare domain.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const { meta } = await getDictionary(locale);

  // Keywords and description come from the dictionary like every other page.
  // This block overrides the layout's, so literals here would serve all three
  // languages the English ones.
  //
  // Built through `pageMetadata` so the share card (image, url, type, site
  // name) is the same as everywhere else — an `openGraph` object here replaces
  // the layout's rather than merging, which is how the most shared page ended
  // up with no image. Only the titles are swapped back to the absolute one.
  const base = pageMetadata({
    title: meta.home.title,
    description: meta.home.description,
    keywords: meta.home.keywords,
    path: routes.home,
    locale,
  });
  return {
    ...base,
    title: { absolute: meta.home.title },
    openGraph: { ...base.openGraph, title: meta.home.title },
    twitter: { ...base.twitter, title: meta.home.title },
  };
}

/** The moments, in the day's order, and the Shopify collection of each. */
const MOMENTS = [
  { key: "brunch", handle: "petit-dejeuner" },
  { key: "lunch", handle: "salades" },
  { key: "pause", handle: "pause" },
] as const;

/**
 * The Studio's photograph for a slot, as a CDN URL (its crop and hotspot
 * kept), or the built-in one while the slot is empty.
 */
function photo<T>(image: SanityImage | null, fallback: T, width = 1600) {
  return image ? urlFor(image).width(width).auto("format").url() : fallback;
}

/** A text from the Studio in this language, else the dictionary's. */
function studioText(
  value: LocaleString | null,
  locale: Locale,
  fallback: string,
) {
  return pick(value ?? undefined, locale)?.trim() || fallback;
}

/** Lunch first: the brief's core — "un déjeuner livré au bureau". */
const DEFAULT_HANDLE = "salades";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const [dict, collections, availability, images] = await Promise.all([
    getDictionary(locale),
    Promise.all(
      MOMENTS.map(({ handle }) =>
        // A collection that fails to load is left out, as on the live home.
        getCollectionByHandle(locale, handle).catch(() => null),
      ),
    ),
    getDeliveryAvailability(),
    getHomePageImages(),
  ]);
  const home = dict.home;

  const tabs = MOMENTS.flatMap(({ key, handle }, index) => {
    const collection = collections[index];
    if (!collection) return [];
    return [
      {
        id: handle,
        label: home.moments[key],
        products: collection.products,
      },
    ];
  });

  return (
    <>
      {/* Defines the organisation, website and business nodes the rest of the
          site's structured data refers back to by @id. */}
      <JsonLd data={siteGraph(SITE_DETAILS, dict.meta.home.description)} />

      <div className="v2">
        <PhotoHero
          headline={studioText(
            images.heroHeadline,
            locale,
            home.heroPhoto.headline,
          )}
          // From the brief, not the intro's wording: the intro just below
          // explains; the hero only sets the tone.
          lead={studioText(images.heroLead, locale, home.heroPhoto.lead)}
          cta={dict.common.aboutUs}
          // Full-bleed, and oversized again for the parallax drift.
          image={photo(images.hero, heroImage, 2400)}
          blurDataURL={images.hero?.lqip}
        />
        {/* The live home's intro, on the grid. Its headline is the page's h1:
            it names the trade and the city, the hero's slogan does not. */}
        <IntroCells
          copy={{
            headline: home.heroPhoto.intro,
            body: home.heroPhoto.introBody,
          }}
          headingAs="h1"
        />
        {/* Joined: it continues the intro, no rule between them. */}
        <ProductCarouselCells
          joined
          tabs={tabs}
          defaultTabId={
            tabs.some((tab) => tab.id === DEFAULT_HANDLE)
              ? DEFAULT_HANDLE
              : tabs[0]?.id
          }
          shopLink={{ href: routes.shop, label: home.moments.shop }}
          soldOutLabel={dict.product.soldOut}
          prevLabel={home.calendar.prev}
          nextLabel={home.calendar.next}
        />
        {/* A row of space: without it the carousel and the beats read as
            one block. */}
        <GridSpacer />
        {/* The live home's three beats, on the grid. */}
        <StoryCells
          label={home.kitchen.label}
          title={home.kitchen.title}
          body={home.kitchen.body}
          src={photo(images.kitchen, kitchenImage)}
        />
        <StoryCells
          theme="sky"
          imageSide="left"
          label={home.delivery.label}
          title={home.delivery.title}
          body={home.delivery.body}
          src={photo(images.delivery, deliveryImage)}
        />
        <StoryCells
          label={home.hosting.label}
          title={home.hosting.title}
          body={home.hosting.body}
          src={photo(images.hosting, hostingImage)}
        />
        <OfferCards
          title={home.offer.title}
          cards={[
            {
              ...home.offer.events,
              href: routes.events,
              image: photo(images.events, eventsImage),
            },
            {
              ...home.offer.companies,
              href: routes.proAccount,
              image: photo(images.companies, companiesImage),
            },
            {
              ...home.offer.coffee,
              href: routes.coffee,
              image: photo(images.coffee, coffeeImage),
            },
          ]}
        />
        {/* The delivery calendar, every day a cell. */}
        <CalendarCells availability={availability} />
      </div>
      <Footer />
    </>
  );
}
