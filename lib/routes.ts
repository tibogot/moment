export const routes = {
  home: "/",
  shop: "/shop",
  collections: "/collections",
  menus: "/menus",
  events: "/events",
  coffee: "/coffee",
  about: "/about",
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

/** The links that appear in the navbar and the mobile menu, in order. */
export const mainNav = [
  { label: "Shop", opensShopMenu: true as const },
  { label: "Menus", href: routes.menus },
  { label: "Events", href: routes.events },
  { label: "Coffee", href: routes.coffee },
  { label: "News", href: routes.news },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
] as const;

/** Footer legal strip — required for a Belgian ecommerce site. */
export const legalNav = [
  { label: "Legal notice", href: routes.legal },
  { label: "Privacy", href: routes.privacy },
  { label: "Cookies", href: routes.cookies },
  { label: "Terms of sale", href: routes.terms },
  { label: "Shipping & returns", href: routes.shipping },
] as const;
