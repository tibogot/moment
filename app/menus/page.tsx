import type { Metadata } from "next";
import { DraftNotice } from "@/components/DraftNotice";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { MenusList } from "@/components/MenusList";
import { PageIntro } from "@/components/PageIntro";
import { MENUS_DRAFT_NOTICE, isPlaceholderContent } from "@/lib/menus";
import { routes } from "@/lib/routes";
import { getMenus } from "@/lib/sanity/queries";
import { breadcrumbSchema, graph, menuListSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Catering Menus & Prices",
  description:
    "Per-person catering menus from our Brussels kitchen — breakfast, office lunch, apéro, buffet and seated dinner, with prices, minimums and notice for each.",
  path: routes.menus,
  keywords: [
    "catering menu Brussels",
    "traiteur prix Brussels",
    "catering prices Brussels",
    "apéro dînatoire Brussels",
    "buffet traiteur Brussels",
  ],
});

export default async function MenusPage() {
  const menus = await getMenus();
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

      <PageIntro
        title="Menus"
        lead="What we cook, by the head. Every format below is a starting point — we change the dishes to the season, the room and whoever is eating."
      />

      {isDraft && (
        <GridSection className="pb-[8svh]">
          <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) md:col-end-9">
            <DraftNotice>{MENUS_DRAFT_NOTICE}</DraftNotice>
          </div>
        </GridSection>
      )}

      <GridSection className="pb-[14svh]">
        <MenusList menus={menus} />
      </GridSection>

      <Footer />
    </>
  );
}
