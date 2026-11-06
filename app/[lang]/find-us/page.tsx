import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { LocaleLink } from "@/components/LocaleLink";
import { PageIntro } from "@/components/PageIntro";
import { PartnerMap, type MapPoint } from "@/components/PartnerMap";
import { DEFAULT_ATELIER } from "@/lib/delivery-zones";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPartners, type Partner } from "@/lib/partners";
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
  const tiles = mapTiles();

  // The atelier first and drawn differently: it is where click & collect
  // orders are picked up, which is a real answer to "where do I find you".
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
      <PageIntro title={t.title} lead={t.lead} />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
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
      </GridSection>

      <Footer />
    </>
  );
}
