export const routes = {
  home: "/",
  shop: "/shop",
  events: "/events",
  coffee: "/coffee",
  about: "/about",
  contact: "/contact",
  /** Added once the Sanity blog lands, mirroring royal-cashmere. */
  journal: "/journal",
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
} as const;

/** The links that appear in the navbar and the mobile menu, in order. */
export const mainNav = [
  { label: "Shop", href: routes.shop },
  { label: "Events", href: routes.events },
  { label: "Coffee", href: routes.coffee },
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
