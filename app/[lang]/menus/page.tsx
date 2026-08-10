import { DraftNotice } from "@/components/DraftNotice";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { MenusList } from "@/components/MenusList";
import { PageIntro } from "@/components/PageIntro";
import { isPlaceholderContent } from "@/lib/menus";
import { routes } from "@/lib/routes";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getMenus } from "@/lib/sanity/queries";
import { breadcrumbSchema, graph, menuListSchema } from "@/lib/schema";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("menus", {
  path: routes.menus,
});

export default async function MenusPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const [menus, dict] = await Promise.all([getMenus(), getDictionary(locale)]);
  const isDraft = isPlaceholderContent(menus);

  return (
    <>
      <JsonLd
        data={graph(
          menuListSchema(menus),
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: "Menus", path: routes.menus },
          ]),
        )}
      />

      <PageIntro title="Menus" lead={dict.menus.lead} />

      {isDraft && (
        <GridSection className="pb-[8svh]">
          <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) md:col-end-9">
            <DraftNotice>{dict.menus.draftNotice}</DraftNotice>
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
