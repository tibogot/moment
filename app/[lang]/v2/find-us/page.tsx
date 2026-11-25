import type { Metadata } from "next";
import { BrandMap } from "@/components/BrandMap";
import { Footer } from "@/components/Footer";
import type { MapPoint } from "@/components/PartnerMap";
import { GridSection } from "@/components/GridSection";
import { PageIntroGrid } from "@/components/v2/PageIntroGrid";
import { DEFAULT_ATELIER } from "@/lib/delivery/zones";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPartners } from "@/lib/partners";
import { formatAddressLine, SITE_DETAILS } from "@/lib/site";

/**
 * Test bench: "Où nous trouver" with the map drawn in the site's colours
 * (BrandMap, MapLibre over Geoapify vector tiles). Not linked, not indexed.
 * The live page is app/[lang]/find-us — untouched until this replaces it.
 * The points are built as there; fold the two into one place when it does.
 */
export const metadata: Metadata = {
  title: "v2 — Où nous trouver",
  robots: { index: false, follow: false },
};

/**
 * The vector style, with the browser key. `GEOAPIFY_MAP_KEY` is the one meant
 * for the browser (restricted to the domain). Until it exists, `next dev`
 * borrows the server-side address key so the test can be seen locally — never
 * on a deployment, where it would be published in every tile request.
 */
function styleUrl() {
  const key =
    process.env.GEOAPIFY_MAP_KEY ??
    (process.env.NODE_ENV === "development"
      ? process.env.GEOAPIFY_API_KEY
      : undefined);
  return key
    ? `https://maps.geoapify.com/v1/styles/positron/style.json?apiKey=${encodeURIComponent(key)}`
    : null;
}

export default async function FindUsTestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const [dict, partners] = await Promise.all([
    getDictionary(locale),
    getPartners(),
  ]);
  const t = dict.findUs;
  const url = styleUrl();

  const points: MapPoint[] = [
    {
      id: "atelier",
      name: t.atelier,
      kindLabel: t.atelierKind,
      address: formatAddressLine(SITE_DETAILS),
      latitude: DEFAULT_ATELIER.latitude,
      longitude: DEFAULT_ATELIER.longitude,
      url: null,
      primary: true,
    },
    ...partners.flatMap((partner) =>
      partner.coordinates
        ? [
            {
              id: partner.id,
              name: partner.name,
              kindLabel: t.kinds[partner.kind],
              address: partner.address,
              latitude: partner.coordinates.latitude,
              longitude: partner.coordinates.longitude,
              url: partner.url,
            },
          ]
        : [],
    ),
  ];

  return (
    <>
      <div className="v2">
        <PageIntroGrid title={t.title} lead={t.lead} />
      </div>

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          {url && (
            <BrandMap
              points={points}
              styleUrl={url}
              labels={{
                directions: t.directions,
                website: t.website,
                mapLabel: t.mapLabel,
                zoomIn: t.zoomIn,
                zoomOut: t.zoomOut,
                closePopup: t.closePopup,
                attribution: t.attribution,
              }}
            />
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
