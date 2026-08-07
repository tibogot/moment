import { routes } from "./routes";
import { absoluteUrl, fullTitle } from "./seo";
import { siteConfig } from "./site";
import type { Menu } from "./menus";
import type { NewsArticle } from "./sanity/types";
import type { ShopifyCollection, ShopifyProduct } from "./shopify/queries";

/**
 * Schema.org for the whole site. Everything hangs off two stable `@id`
 * anchors — the organisation and the website — so a product page can point at
 * the same publisher node the home page defines instead of restating it.
 *
 * Several company facts (address, phone, VAT) are still blank in siteConfig
 * while we wait on the client. Blank values are dropped rather than emitted
 * empty: a missing property is fine, an empty one is a data-quality signal.
 */

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

type JsonLdValue = string | number | boolean | object | undefined | null;

/** Drops keys whose value is empty — see the note above. */
function compact<T extends Record<string, JsonLdValue>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );
}

function postalAddress() {
  const { street, postalCode, city, region, country } = siteConfig.contact;

  return compact({
    "@type": "PostalAddress",
    streetAddress: street,
    postalCode,
    addressLocality: city,
    addressRegion: region,
    addressCountry: country === "Belgium" ? "BE" : country,
  });
}

function socialProfiles() {
  return Object.values(siteConfig.social).filter(Boolean);
}

export function organizationSchema() {
  return compact({
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.legal.companyName || siteConfig.name,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: absoluteUrl("/icon.png"),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: postalAddress(),
    sameAs: socialProfiles(),
    vatID: siteConfig.legal.vatNumber,
    taxID: siteConfig.legal.enterpriseNumber,
  });
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.defaultLocale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * The trading entity as Google understands a caterer: a food business that
 * serves an area rather than seating guests at an address.
 */
export function cateringBusinessSchema() {
  return compact({
    "@type": "FoodEstablishment",
    additionalType: "https://schema.org/CateringBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: absoluteUrl("/opengraph-image"),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    servesCuisine: ["Seasonal", "Belgian", "European"],
    address: postalAddress(),
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Brussels-Capital Region",
    },
    availableLanguage: [...siteConfig.locales],
    sameAs: socialProfiles(),
    parentOrganization: { "@id": ORGANIZATION_ID },
  });
}

/** Home page graph — the three nodes every other page refers back to. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      cateringBusinessSchema(),
    ],
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: ShopifyProduct) {
  const url = absoluteUrl(routes.product(product.handle));
  const images = product.images?.length
    ? product.images.map((image) => image.url)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return compact({
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: product.description,
    image: images,
    sku: product.handle,
    category: product.productType,
    url,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: compact({
      "@type": "Offer",
      url,
      price: product.priceAmount,
      priceCurrency: product.currencyCode,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      // Distance selling in Belgium: the offer is made by the trading entity,
      // not the kitchen brand.
      seller: { "@id": ORGANIZATION_ID },
    }),
  });
}

export function collectionSchema(collection: ShopifyCollection) {
  const url = absoluteUrl(routes.collection(collection.handle));

  return compact({
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: collection.title,
    description: collection.description,
    url,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collection.products.length,
      itemListElement: collection.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.title,
        url: absoluteUrl(routes.product(product.handle)),
      })),
    },
  });
}

export function articleSchema(
  article: NewsArticle,
  { imageUrl }: { imageUrl?: string | null } = {},
) {
  const url = absoluteUrl(routes.newsArticle(article.slug.current));

  return compact({
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    url,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: siteConfig.defaultLocale,
    articleSection: article.categories?.[0]?.title,
    author: article.author?.name
      ? { "@type": "Person", name: article.author.name }
      : { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  });
}

/**
 * A catering menu. `Menu` inherits `offers` from CreativeWork, so the price can
 * hang off the menu itself rather than off each dish — which is how it is
 * actually sold: per head, for the whole format.
 *
 * The price is a UnitPriceSpecification with a reference quantity of one
 * person, not a flat `price`. Stating "45" against a buffet without saying
 * "per person" would be a wrong number, and prices in structured data are the
 * one thing a search engine will quote back at a customer.
 */
export function menuSchema(menu: Menu) {
  const url = absoluteUrl(routes.menu(menu.slug.current));

  return compact({
    "@type": "Menu",
    "@id": `${url}#menu`,
    name: menu.title,
    description: menu.summary,
    url,
    inLanguage: siteConfig.defaultLocale,
    provider: { "@id": `${siteConfig.url}/#business` },
    isPartOf: { "@id": WEBSITE_ID },
    hasMenuSection: menu.courses?.map((course) =>
      compact({
        "@type": "MenuSection",
        name: course.title,
        hasMenuItem: course.items?.map((item) => ({
          "@type": "MenuItem",
          name: item,
        })),
      }),
    ),
    offers: compact({
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: menu.pricePerPerson,
        priceCurrency: "EUR",
        // The menu is quoted before VAT; saying otherwise misstates the price.
        valueAddedTaxIncluded: false,
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitText: "person",
        },
      },
      eligibleQuantity: compact({
        "@type": "QuantitativeValue",
        minValue: menu.minGuests,
        maxValue: menu.maxGuests,
        unitText: "person",
      }),
      seller: { "@id": ORGANIZATION_ID },
      // Quote-only: there is no checkout for these, the enquiry is the action.
      availability: "https://schema.org/InStock",
    }),
  });
}

/** The menus index, as a list pointing at each menu's own node. */
export function menuListSchema(menus: Menu[]) {
  const url = absoluteUrl(routes.menus);

  return {
    "@type": "CollectionPage",
    "@id": `${url}#menus`,
    name: fullTitle("Menus"),
    url,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": `${siteConfig.url}/#business` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: menus.length,
      itemListElement: menus.map((menu, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: menu.title,
        url: absoluteUrl(routes.menu(menu.slug.current)),
      })),
    },
  };
}

/**
 * FAQPage, which is the one piece of structured data on this site that can
 * change what a search result looks like: Google renders the questions as
 * expandable rows under the listing.
 *
 * Answers must be plain text — the spec allows limited HTML, but anything that
 * needs markup to make sense reads badly in a SERP, and a question that cannot
 * be answered in a sentence or two probably belongs on its own page.
 */
export function faqSchema(entries: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/** Wraps one or more nodes in the `@context` the parser expects. */
export function graph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
