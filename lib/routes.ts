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
