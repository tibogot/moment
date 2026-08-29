import type { StructureResolver } from "sanity/structure";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { HomeIcon } from "@sanity/icons/Home";
import { ImagesIcon } from "@sanity/icons/Images";
import { TagIcon } from "@sanity/icons/Tag";
import { UlistIcon } from "@sanity/icons/Ulist";
import { UsersIcon } from "@sanity/icons/Users";

/**
 * The Studio's left-hand navigation.
 *
 * Written in the words the client uses on their own site, not in the words the
 * schema uses. "Articles / Categories / Authors" is a list of document types;
 * "Menus / Réalisations / Actualités" is a list of things a caterer wants to
 * change. The order is roughly how often each is touched.
 *
 * And that is the only test anything here has to pass. "Coordonnées de
 * l'entreprise" used to sit at the bottom of this list, holding the address,
 * the phone number and the VAT number. It came out on 29 August 2026: those
 * change once every few years, they are now hardcoded in `lib/site.ts`, and a
 * screen an owner will never open teaches them the rest of the Studio is
 * decorative too.
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

      /**
       * Ordered by date rather than by Sanity's default, which is last-edited.
       * These are added in bursts after a busy fortnight, so "the one I touched
       * most recently" is never the one being looked for.
       */
      S.listItem()
        .title("Réalisations")
        .icon(ImagesIcon)
        .schemaType("pastEvent")
        .child(
          S.documentTypeList("pastEvent")
            .title("Réalisations")
            .defaultOrdering([{ field: "date", direction: "desc" }]),
        ),

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
       * Pinned to a fixed document id, which is what makes it a singleton: no
       * "create new" button, no second copy competing to be read. The query in
       * `lib/sanity/queries.ts` looks that id up directly.
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
    ]);
