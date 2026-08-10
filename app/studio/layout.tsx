import { NextStudioLayout } from "next-sanity/studio";

/**
 * A second root layout, for the Studio branch only.
 *
 * This app has no `app/layout.tsx`: `app/[lang]/layout.tsx` is the root layout,
 * and it only covers `/[lang]/*`. Adding `/studio` as a sibling left that route
 * with no layout carrying `<html>` and `<body>` — it still rendered, but into a
 * fragment, which is what produced React's "Cannot render <noscript> outside the
 * main document" as the Studio tried to hoist its no-JS notice into a head that
 * was not there.
 *
 * `globals.css` is deliberately not imported. The Studio ships its own reset and
 * type scale, and this site's Tailwind base plus its four custom faces would
 * fight both. Nothing here should look like the rest of the site.
 */
export const metadata = {
  title: "Moment Studio",
};

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {/* Sets the full-height, no-overscroll frame the Studio expects. */}
        <NextStudioLayout>{children}</NextStudioLayout>
      </body>
    </html>
  );
}
