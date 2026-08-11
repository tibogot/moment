"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";

/**
 * The navbar's product data, loaded after the page is, not inside it.
 *
 * See the note in `app/api/nav-catalog/route.ts` for why. The short version:
 * the shop dropdown's previews and the search panel's list are both behind an
 * interaction, but as props on `<Navbar>` they were serialised into every
 * page's HTML and parsed during hydration.
 *
 * The collections arrive from the server as usual — they are the nav's links,
 * and a title and a handle each is not worth a round trip — but with their
 * `products` emptied by the layout. This fills them back in, along with the
 * flat product list, once the browser has nothing better to do.
 */
type NavCatalog = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  /** Pulls the fetch forward when something is about to need it. */
  load: () => void;
};

const NavCatalogContext = createContext<NavCatalog | null>(null);

/*
 * Idle rather than on mount: the point of moving this off the critical path is
 * not to put it back on. Safari has no requestIdleCallback, so it gets a timer
 * long enough to clear hydration.
 */
const IDLE_FALLBACK_MS = 1500;

function whenIdle(run: () => void) {
  if (typeof requestIdleCallback === "function") {
    const handle = requestIdleCallback(run, { timeout: 3000 });
    return () => cancelIdleCallback(handle);
  }

  const handle = setTimeout(run, IDLE_FALLBACK_MS);
  return () => clearTimeout(handle);
}

export function NavCatalogProvider({
  collections: initialCollections,
  children,
}: {
  collections: ShopifyCollection[];
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collections, setCollections] = useState(initialCollections);
  const startedRef = useRef(false);

  const load = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    fetch(`/api/nav-catalog?lang=${locale}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: NavCatalog | null) => {
        if (!data) return;
        setProducts(data.products);
        // Only if Shopify actually answered. An empty list here would blank
        // the nav's links, which are the one part that did render server-side.
        if (data.collections.length > 0) setCollections(data.collections);
      })
      .catch(() => {
        /* The previews and search stay empty; the links still work. */
        startedRef.current = false;
      });
  }, [locale]);

  useEffect(() => whenIdle(load), [load]);

  return (
    <NavCatalogContext.Provider value={{ products, collections, load }}>
      {children}
    </NavCatalogContext.Provider>
  );
}

/**
 * Falls back to empty rather than throwing: every consumer already renders
 * sensibly with no products — that is the state the page starts in.
 */
export function useNavCatalog(): NavCatalog {
  return (
    useContext(NavCatalogContext) ?? {
      products: [],
      collections: [],
      load: () => {},
    }
  );
}
