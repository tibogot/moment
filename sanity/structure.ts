import type { StructureResolver } from "sanity/structure";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { HomeIcon } from "@sanity/icons/Home";
import { TagIcon } from "@sanity/icons/Tag";
import { UlistIcon } from "@sanity/icons/Ulist";
import { UsersIcon } from "@sanity/icons/Users";

/**
 * The Studio's left-hand navigation.
 *
 * Written in the words the client uses on their own site, not in the words the
 * schema uses. "Articles / Categories / Authors / Site settings" is a list of
 * document types; "Menus / Actualités / Coordonnées" is a list of things a
 * caterer wants to change. The order is roughly how often each is touched.
 *
 * Categories and authors sit below a divider because they exist to support
 * articles rather than to be visited: someone looking for where to write a news
 * post should not have to read past them.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Moment")
    .items([
      S.listItem()
        .title("Menus traiteur")
        .icon(UlistIcon)
        .schemaType("menu")
        .child(S.documentTypeList("menu").title("Menus traiteur")),

      S.listItem()
        .title("Actualités")
        .icon(DocumentTextIcon)
        .schemaType("article")
        .child(S.documentTypeList("article").title("Actualités")),

      S.divider(),

      S.listItem()
        .title("Rubriques")
        .icon(TagIcon)
        .schemaType("category")
        .child(S.documentTypeList("category").title("Rubriques")),

      S.listItem()
        .title("Auteurs")
        .icon(UsersIcon)
        .schemaType("author")
        .child(S.documentTypeList("author").title("Auteurs")),

      S.divider(),

      /**
       * Both of these are pinned to a fixed document id, which is what makes
       * them singletons: no "create new" button, no second copy competing to be
       * read. The queries in `lib/sanity/queries.ts` look these ids up directly.
       */
      S.listItem()
        .title("Page d'accueil")
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Page d'accueil"),
        ),

      S.listItem()
        .title("Coordonnées de l'entreprise")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Coordonnées de l'entreprise"),
        ),
    ]);
