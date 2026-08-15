import { stripLocale, withLocale, type Locale } from "@/lib/i18n/config";

/**
 * The routes below are language-agnostic: `/shop`, not `/fr/shop`. They are the
 * shape the sitemap, the metadata and the hreflang alternates all want, because
 * each of those has to talk about the same page in three languages.
 *
 * Anything rendered into an `href` has to go through `href()` instead. A bare
 * `/shop` still resolves — the proxy prefixes it — but at the cost of a
 * redirect on every single navigation, which is a real tax on a site whose
 * whole feel is quick transitions.
 */
export function href(locale: Locale, path: string) {
  return withLocale(path, locale);
}

export const routes = {
  home: "/",
  shop: "/shop",
  collections: "/collections",
  menus: "/menus",
  events: "/events",
  coffee: "/coffee",
  about: "/about",
  faq: "/faq",
  proAccount: "/pro",
  contact: "/contact",
  news: "/news",
  cart: "/cart",
  search: "/search",
  account: "/account",
  signIn: "/signin",
  authLogin: "/api/auth/login",
  authLogout: "/api/auth/logout",
  /** Belgian legal pages — copy is stubbed until final review. */
  legal: "/legal",
  privacy: "/privacy",
  cookies: "/cookies",
  terms: "/terms",
  shipping: "/shipping",
  product: (handle: string) => `/products/${handle}`,
  collection: (handle: string) => `/collections/${handle}`,
  menu: (slug: string) => `/menus/${slug}`,
  newsArticle: (slug: string) => `/news/${slug}`,
} as const;

/**
 * The links that appear in the navbar and the mobile menu, in order.
 *
 * `key` rather than a label: the wording now lives in the dictionaries under
 * `nav`, and the type ties the two together, so adding an entry here without
 * translating it is a compile error rather than an English word on a Dutch
 * page.
 */
export const mainNav = [
  { key: "shop", menu: "shop" as const },
  { key: "menus", href: routes.menus },
  { key: "events", href: routes.events },
  { key: "coffee", href: routes.coffee },
  { key: "about", menu: "about" as const },
  { key: "contact", href: routes.contact },
] as const;

/** The two nav entries that open a panel instead of going somewhere. */
export type NavMenuKey = "shop" | "about";

/**
 * What sits behind "About".
 *
 * News moved in here and Contact deliberately did not. Seven top-level links
 * did not fit once the labels were French — "Événements" and "Actualités" are
 * half again as long as their English counterparts — and something had to give.
 * News is low-traffic editorial and groups naturally with the story; Contact is
 * where every quote, event and sur-devis delivery starts, and burying the
 * enquiry link to save fifty pixels would be a poor trade for a business that
 * sells by conversation.
 */
export const aboutNav = [
  { key: "story", href: routes.about },
  { key: "news", href: routes.news },
  { key: "faq", href: routes.faq },
] as const;

/** Footer legal strip — required for a Belgian ecommerce site. */
export const legalNav = [
  { key: "legal", href: routes.legal },
  { key: "privacy", href: routes.privacy },
  { key: "cookies", href: routes.cookies },
  { key: "terms", href: routes.terms },
  { key: "shipping", href: routes.shipping },
] as const;

/**
 * Where the language switcher should send someone reading this path.
 *
 * Almost always the same page in the other language — menus carry their three
 * languages in one document, and products and collections share a Shopify
 * handle across all of them, so swapping the prefix lands on a real page.
 *
 * Articles are the exception, and it is a modelling decision rather than an
 * oversight: long-form gets one document per language, so a French article and
 * its Dutch counterpart are two documents with two different slugs, and nothing
 * yet connects them. Swapping the prefix on an article URL produces a 404 every
 * time. Until a translation reference exists the honest answer is the news
 * index in the language asked for — we do not know where the translation is, or
 * whether it was ever written.
 *
 * When that reference lands, this is where the real slug lookup replaces the
 * fallback. See TODO.md §2.
 */
export function translatedPath(pathname: string, locale: Locale) {
  const path = stripLocale(pathname);
  const isArticle = path.startsWith(`${routes.news}/`);

  return withLocale(isArticle ? routes.news : path, locale);
}
