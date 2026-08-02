/**
 * Renders a Schema.org graph into the document.
 *
 * Escaping `<` is the sanitisation step the Next docs call for — JSON.stringify
 * alone would let a stray tag in CMS or Shopify copy close the script early.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
