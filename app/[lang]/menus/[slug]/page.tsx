import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import { DraftNotice } from "@/components/DraftNotice";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { SanityImage } from "@/components/SanityImage";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { PLACEHOLDER_MENUS, formatMenuTerms, type Menu } from "@/lib/menus";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import { getMenuBySlug, getMenuSlugs } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { breadcrumbSchema, graph, menuSchema } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";

type MenuPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getMenuSlugs();
  return slugs.map((slug) => ({ slug }));
}

function shareImage(menu: Menu) {
  if (!menu.image?.asset) return null;

  return {
    url: urlFor(menu.image).width(1200).height(630).fit("crop").url(),
    alt: menu.image.alt ?? menu.title,
  };
}

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const [menu, dict] = await Promise.all([
    getMenuBySlug(slug),
    getDictionary(locale),
  ]);

  if (!menu) return notFoundMetadata();

  // The price belongs in the snippet: "from €32 per person" is the line that
  // decides whether the result is worth a click for a catering search.
  const price = interpolate(dict.menus.metaPrice, {
    price: formatMoney(locale, menu.pricePerPerson),
    terms: formatMenuTerms(dict.menus, menu).toLowerCase(),
  });

  return pageMetadata({
    locale,
    title: `${menu.title} — ${dict.menuFormats[menu.format] ?? dict.meta.fallback.menu}`,
    description: toDescription(
      menu.summary ? `${menu.summary} ${price}` : price,
    ),
    path: routes.menu(menu.slug.current),
    image: shareImage(menu),
  });
}

/** A list of plain strings under a small caps heading. */
function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-owners-medium text-[11px] uppercase tracking-wide">
        {title}
      </h3>
      <ul className="mt-3">
        {items.map((item) => (
          <li
            key={item}
            className="font-archivo-light border-t border-sky py-2.5 text-[18px] leading-normal first:border-t-0 first:pt-0"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const [menu, dict] = await Promise.all([
    getMenuBySlug(slug),
    getDictionary(locale),
  ]);

  if (!menu) notFound();

  const isDraft = PLACEHOLDER_MENUS.includes(menu);
  const formatLabel = dict.menuFormats[menu.format] ?? menu.format;

  /**
   * The enquiry carries the menu with it. `occasion` is prefilled because the
   * field is required and a menu enquiry is always an event; the message gives
   * the kitchen the format and the price the visitor was actually looking at,
   * which is the whole reason to route through here rather than a bare link.
   */
  const quoteHref = `${routes.contact}?occasion=Event&menu=${encodeURIComponent(menu.slug.current)}`;

  return (
    <>
      <JsonLd
        data={graph(
          menuSchema(menu),
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: "Menus", path: routes.menus },
            { name: menu.title, path: routes.menu(menu.slug.current) },
          ]),
        )}
      />

      <GridSection className="pt-[22svh] pb-[8svh]">
        <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
          <TextReveal
            blockColor={REVEAL_BLOCK}
            animateOnScroll={false}
            delay={0.05}
          >
            <p className="font-owners-medium text-[11px] uppercase tracking-wide text-black/55">
              {formatLabel}
            </p>
          </TextReveal>

          <TextReveal
            blockColor={REVEAL_BLOCK}
            animateOnScroll={false}
            delay={0.15}
          >
            <h1 className="font-owners-narrow-bold mt-6 max-w-full text-[11vw] leading-[0.9] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(8vw,12svh)]">
              {menu.title}
            </h1>
          </TextReveal>

          {menu.summary && (
            <TextReveal
              blockColor={REVEAL_BLOCK}
              animateOnScroll={false}
              delay={0.35}
            >
              <p className="font-archivo-light mt-[5svh] max-w-[44ch] text-(length:--body-text) leading-normal text-black/70">
                {menu.summary}
              </p>
            </TextReveal>
          )}
        </div>
      </GridSection>

      {isDraft && (
        <GridSection className="pb-[6svh]">
          <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) md:col-end-9">
            <DraftNotice>{dict.menus.draftNotice}</DraftNotice>
          </div>
        </GridSection>
      )}

      {/* Inside the grid rather than full bleed, so the photograph starts and
          stops on the two spines every other block on this page is measured
          against — its edges continue the rules instead of cutting across
          them. No width of its own: the column span is the width. */}
      {menu.image && (
        <GridSection>
          <div className="relative col-start-2 col-end-5 aspect-4/3 overflow-hidden bg-sky/20 md:col-end-9 md:aspect-16/10">
            <SanityImage
              image={menu.image}
              alt={menu.image.alt ?? menu.title}
              // Margin to margin, not edge to edge: --grid-margin is
              // max(1.25rem, 4.9vw), which leaves ~90vw at every width from a
              // 375px phone to a 1440px desktop.
              sizes="90vw"
              priority
            />
          </div>
        </GridSection>
      )}

      {/* The price band. Given its own ruled row rather than folded into the
          header: it is the answer the page was opened for, and it has to be
          findable without reading the dishes first. */}
      <GridSection className="pt-[8svh] pb-[8svh]">
        <div className="col-start-2 col-end-5 min-w-0 md:col-end-9">
          <div className="border-y border-sky px-(--grid-gutter) py-[5svh] md:grid md:grid-cols-7 md:gap-(--grid-gutter)">
            <div className="min-w-0 md:col-span-4">
              <p className="font-owners-narrow-bold text-[12vw] leading-none md:text-[min(4.4vw,7svh)]">
                {formatMoney(locale, menu.pricePerPerson)}
                <span className="font-archivo-light ml-3 text-[18px] leading-none">
                  {dict.menus.perPerson}
                </span>
              </p>

              {menu.priceNote && (
                <p className="font-archivo-light mt-4 text-[13px] text-black/55">
                  {menu.priceNote}
                </p>
              )}

              <p className="font-archivo-light mt-4 text-[18px] leading-normal">
                {formatMenuTerms(dict.menus, menu)}
              </p>
            </div>

            <div className="mt-8 min-w-0 md:col-span-3 md:mt-0">
              <p className="font-archivo-light max-w-[34ch] text-[18px] leading-normal">
                {dict.menus.quoteNote}
              </p>

              <Link
                href={quoteHref}
                className="mt-6 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
              >
                <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                  {dict.menus.requestMenu}
                  <span aria-hidden>&rarr;</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </GridSection>

      {menu.courses && menu.courses.length > 0 && (
        <GridSection className="pb-[8svh]">
          <div className="col-start-2 col-end-5 min-w-0 md:col-end-9">
            <div className="border-b border-sky">
              {menu.courses.map((course) => (
                <div
                  key={course._key}
                  className="border-t border-sky px-(--grid-gutter) py-[4svh] md:grid md:grid-cols-7 md:gap-(--grid-gutter)"
                >
                  <h2 className="font-owners-medium text-[11px] uppercase tracking-wide md:col-span-2">
                    {course.title}
                  </h2>

                  <ul className="mt-4 min-w-0 md:col-span-5 md:mt-0">
                    {course.items.map((item) => (
                      <li
                        key={item}
                        className="font-archivo-light text-[18px] leading-[1.6]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </GridSection>
      )}

      {(menu.includes?.length || menu.excludes?.length || menu.dietaryNote) && (
        <GridSection className="pb-[8svh]">
          <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) md:col-end-9">
            <div className="grid gap-[5svh] md:grid-cols-2 md:gap-(--grid-gutter)">
              {menu.includes && menu.includes.length > 0 && (
                <DetailList title={dict.menus.included} items={menu.includes} />
              )}

              {menu.excludes && menu.excludes.length > 0 && (
                <DetailList
                  title={dict.menus.quotedSeparately}
                  items={menu.excludes}
                />
              )}
            </div>

            {menu.dietaryNote && (
              <div className="mt-[5svh] border-t border-sky pt-[4svh]">
                <h3 className="font-owners-medium text-[11px] uppercase tracking-wide">
                  {dict.menus.dietary}
                </h3>
                <p className="font-archivo-light mt-3 max-w-[52ch] text-[18px] leading-normal">
                  {menu.dietaryNote}
                </p>
              </div>
            )}
          </div>
        </GridSection>
      )}

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 flex flex-wrap gap-3 px-(--grid-gutter) md:col-end-9">
          <Link
            href={routes.menus}
            className="font-owners-medium inline-block border border-sky px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 hover:bg-sky/30"
          >
            {dict.menus.allMenus}
          </Link>

          <Link
            href={quoteHref}
            className="font-owners-medium inline-block border border-sky bg-sky px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 hover:bg-cream"
          >
            {dict.menus.requestMenu}
          </Link>
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
