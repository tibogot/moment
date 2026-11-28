import { Footer } from "@/components/Footer";
import { LocaleLink } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import { PageIntroContent } from "@/components/v2/PageIntroGrid";
import { PartnerMap } from "@/components/PartnerMap";
import { BrandMap, type BrandMapPoint } from "@/components/BrandMap";
import { withLocale } from "@/lib/i18n/config";
import { DEFAULT_ATELIER } from "@/lib/delivery/zones";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPartners, type Partner } from "@/lib/partners";
import { pick } from "@/lib/sanity/locale";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { formatAddressLine, SITE_DETAILS, siteIsIndexable } from "@/lib/site";

export const generateMetadata = localizedMetadata("findUs", {
  path: routes.findUs,
});

/**
 * Which map tiles to draw, or null for no map.
 *
 * Geoapify's light "positron" style in production, with its own browser key
 * (`GEOAPIFY_MAP_KEY`, restricted to the site's domain in the Geoapify
 * dashboard — it is visible in every tile URL, unlike the server-side address
 * key). OpenStreetMap's own tiles are only used on local and preview
 * deployments: their usage policy does not allow a commercial site to lean on
 * them. Production without the key shows the list alone, which carries
 * everything the map does.
 */
function mapTiles() {
  const key = process.env.GEOAPIFY_MAP_KEY;
  if (key) {
    return {
      url: `https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=${encodeURIComponent(key)}`,
      attribution:
        'Powered by <a href="https://www.geoapify.com/">Geoapify</a> | © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    };
  }
  if (!siteIsIndexable) {
    return {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    };
  }
  return null;
}

/**
 * The map in the site's colours (BrandMap: MapLibre over Geoapify's vector
 * "positron" style, restyled in lib/map/brandStyle.ts) — since 26 November
 * 2026 the page's map, tried first on /v2/find-us.
 *
 * Needs the browser key, `GEOAPIFY_MAP_KEY`, restricted in the Geoapify
 * dashboard to the site's addresses: it is visible in every tile request. On
 * `next dev` the server-side address key stands in so the map can be seen
 * locally — never on a deployment. Without a key the page falls back to the
 * raster map below (OpenStreetMap, test deployments only) or to the list.
 */
function brandStyleUrl() {
  const key =
    process.env.GEOAPIFY_MAP_KEY ??
    (process.env.NODE_ENV === "development"
      ? process.env.GEOAPIFY_API_KEY
      : undefined);
  return key
    ? `https://maps.geoapify.com/v1/styles/positron/style.json?apiKey=${encodeURIComponent(key)}`
    : null;
}

/** Grouped by commune, communes alphabetical — how people look for "one near me". */
function byCity(partners: Partner[]) {
  const groups = new Map<string, Partner[]>();
  for (const partner of partners) {
    groups.set(partner.city, [...(groups.get(partner.city) ?? []), partner]);
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b, "fr"));
}

export default async function FindUsPage({
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
  const styleUrl = brandStyleUrl();
  const tiles = styleUrl ? null : mapTiles();

  // The atelier first and drawn differently: it is where click & collect
  // orders are picked up, which is a real answer to "where do I find you".
  const points: BrandMapPoint[] = [
    {
      id: "atelier",
      name: t.atelier,
      kindLabel: t.atelierKind,
      address: formatAddressLine(SITE_DETAILS),
      latitude: DEFAULT_ATELIER.latitude,
      longitude: DEFAULT_ATELIER.longitude,
      url: null,
      primary: true,
      // The atelier's popup says how collection works and leads to the shop.
      note: t.atelierNote,
      cta: { href: withLocale(routes.shop, locale), label: t.orderPickup },
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
              note:
                pick(partner.offer ?? undefined, locale)?.trim() || undefined,
            },
          ]
        : [],
    ),
  ];

  return (
    <>
      {/* On the page's 16 / 12 / 4 grid since 28 November 2026, like the FAQ:
          one section, the frame (the navbar's rule and the two spines), the
          title and the lead on the cells — the lead from the left, under
          the title — then the map and the list between the spines. */}
      <div className="v2">
        <section
          className="relative w-full bg-cream"
          style={{ paddingTop: "var(--grid-band)" }}
        >
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            cells={false}
            readout={false}
            bottomBand="0px"
          />
          <PageIntroContent title={t.title} lead={t.lead} leadSide="left" />
          <div
            className="relative grid"
            style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
          >
            <div className="col-[2/-2] min-w-0 px-(--v2-pad) pb-[14svh]">
              {styleUrl && (
                <BrandMap
                  points={points}
                  styleUrl={styleUrl}
                  labels={{
                    directions: t.directions,
                    website: t.website,
                    mapLabel: t.mapLabel,
                    zoomIn: t.zoomIn,
                    zoomOut: t.zoomOut,
                    closePopup: t.closePopup,
                    attribution: t.attribution,
                    legendAtelier: t.legendAtelier,
                    legendPartners: t.legendPartners,
                  }}
                />
              )}
              {tiles && (
                <PartnerMap
                  points={points}
                  tiles={tiles}
                  labels={{
                    directions: t.directions,
                    website: t.website,
                    mapLabel: t.mapLabel,
                  }}
                />
              )}

              <h2 className="font-owners-medium mt-12 text-[12px] uppercase tracking-wide">
                {t.listTitle}
              </h2>

              {partners.length === 0 ? (
                <p className="font-archivo-light mt-5 max-w-150 text-[15px]">
                  {t.empty}
                </p>
              ) : (
                <div className="mt-5 space-y-8">
                  {byCity(partners).map(([city, group]) => (
                    <section key={city}>
                      <h3 className="font-owners-medium text-[11px] uppercase tracking-wide opacity-60">
                        {city}
                      </h3>
                      <ul className="mt-2">
                        {group.map((partner) => (
                          <li
                            key={partner.id}
                            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-sky py-4"
                          >
                            <div>
                              <p className="font-owners-medium text-[14px] uppercase tracking-wide">
                                {partner.name}
                              </p>
                              <p className="font-archivo-light text-[14px]">
                                {t.kinds[partner.kind]} · {partner.address}
                              </p>
                              {pick(
                                partner.offer ?? undefined,
                                locale,
                              )?.trim() && (
                                <p className="font-archivo-light mt-1 text-[14px] opacity-70">
                                  {pick(partner.offer ?? undefined, locale)}
                                </p>
                              )}
                            </div>
                            <p className="font-archivo-light flex gap-4 text-[13px]">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${partner.name}, ${partner.address}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 transition-opacity hover:opacity-60"
                              >
                                {t.directions}
                              </a>
                              {partner.url && (
                                <a
                                  href={partner.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2 transition-opacity hover:opacity-60"
                                >
                                  {t.website}
                                </a>
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}

              <p className="font-archivo-light mt-12 border-t border-sky pt-6 text-[15px]">
                {t.partnerCta}{" "}
                <LocaleLink
                  href={routes.collaborations}
                  className="underline underline-offset-2 transition-opacity hover:opacity-60"
                >
                  {t.partnerLink}
                </LocaleLink>
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
