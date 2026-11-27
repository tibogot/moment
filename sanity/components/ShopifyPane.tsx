/**
 * "Produits et livraison" in the Studio: not content, a signpost.
 *
 * The first thing an owner looks for in a CMS is their products, and here they
 * are not in it — products, prices, delivery zones, slots and closures all live
 * in Shopify. Without this entry, the Studio's first impression is "my products
 * are missing".
 *
 * Plain markup rather than `@sanity/ui`, which is not a direct dependency of
 * the project; the Studio's own font and colours are inherited.
 */
const SHOPIFY_ADMIN = "https://admin.shopify.com/store/hhfesf-40";

const LINKS = [
  {
    label: "Produits",
    hint: "ajouter, modifier, prix, photos",
    path: "/products",
  },
  { label: "Commandes", hint: "les commandes reçues", path: "/orders" },
  {
    label: "Livraison : zones, créneaux, fermetures",
    hint: "Contenu → Métaobjets",
    path: "/content/metaobjects",
  },
];

export function ShopifyPane() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: "36rem", lineHeight: 1.5 }}>
      <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.75rem" }}>
        Produits et livraison
      </h2>
      <p style={{ margin: "0 0 0.75rem" }}>
        Les produits, les prix, les commandes et les réglages de livraison ne se
        modifient pas ici, mais dans <strong>Shopify</strong>. Ce que vous y
        changez apparaît sur le site en une minute environ.
      </p>
      <p style={{ margin: "0 0 1.25rem", opacity: 0.75 }}>
        Ce Studio sert aux photos, au bandeau, aux infos pratiques, à la FAQ,
        aux avis, aux actualités et aux partenaires.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {LINKS.map((link) => (
          <li key={link.path} style={{ marginBottom: "0.75rem" }}>
            <a
              href={`${SHOPIFY_ADMIN}${link.path}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600 }}
            >
              {link.label} ↗
            </a>
            <div style={{ opacity: 0.7, fontSize: "0.875rem" }}>
              {link.hint}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
