import { DraftNotice } from "@/components/DraftNotice";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { MenusList } from "@/components/MenusList";
import { PageIntro } from "@/components/PageIntro";
import { isPlaceholderContent, resolveMenu } from "@/lib/menus";
import { routes } from "@/lib/routes";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getMenus } from "@/lib/sanity/queries";
import { breadcrumbSchema, graph, menuListSchema } from "@/lib/schema";
import { fullTitle, localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("menus", {
  path: routes.menus,
});

export default async function MenusPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const [rawMenus, dict] = await Promise.all([
    getMenus(),
    getDictionary(locale),
  ]);
  const isDraft = isPlaceholderContent(rawMenus);
  // Flattened into this page's language once, so nothing below it has to know
  // that a field might be missing a translation.
  const menus = rawMenus.map((menu) => resolveMenu(menu, locale));

  return (
    <>
      <JsonLd
        data={graph(
          menuListSchema(locale, fullTitle(dict.nav.menus), menus),
          breadcrumbSchema(locale, [
            { name: dict.nav.home, path: routes.home },
            { name: dict.nav.menus, path: routes.menus },
          ]),
        )}
      />

      <PageIntro title="Menus" lead={dict.menus.lead} />

      {isDraft && (
        <GridSection className="pb-[8svh]">
          <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) md:col-end-9">
            <DraftNotice label={dict.menus.draftLabel}>
              {dict.menus.draftNotice}
            </DraftNotice>
          </div>
        </GridSection>
      )}

      <GridSection className="pb-[14svh]">
        <MenusList
          menus={menus}
          locale={locale}
          copy={dict.menus}
          formats={dict.menuFormats}
        />
      </GridSection>

      <Footer />
    </>
  );
}
