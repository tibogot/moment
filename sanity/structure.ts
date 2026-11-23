import type { StructureResolver } from "sanity/structure";
import { BasketIcon } from "@sanity/icons/Basket";
import { BellIcon } from "@sanity/icons/Bell";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { HomeIcon } from "@sanity/icons/Home";
import { ImagesIcon } from "@sanity/icons/Images";
import { PinIcon } from "@sanity/icons/Pin";
import { TagIcon } from "@sanity/icons/Tag";
import { UlistIcon } from "@sanity/icons/Ulist";
import { UsersIcon } from "@sanity/icons/Users";
import { ShopifyPane } from "@/sanity/components/ShopifyPane";

/**
 * The Studio's left-hand navigation.
 *
 * Written in the words the client uses on their own site, not in the words the
 * schema uses. "Articles / Categories / Authors" is a list of document types;
 * "Menus / Réalisations / Actualités" is a list of things a caterer wants to
 * change.
 *
 * And that is the only test anything here has to pass. There is no
 * "Coordonnées de l'entreprise" screen for the address, the phone number and
 * the VAT number: those change once every few years, they are hardcoded in
 * `lib/site.ts`, and a screen an owner will never open teaches them the rest
 * of the Studio is decorative too.
 *
 * The order:
 * - the announcement bar alone at the top — the most frequent edit, and the
 *   one made in a hurry ("fermé demain");
 * - "Pages du site": one entry per page, named as in the site's menu;
 * - "Contenus": the lists that grow (a menu, a réalisation, an article);
 * - "Produits et livraison": a signpost to Shopify, where the first thing an
 *   owner looks for actually lives.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Moment")
    .items([
      /**
       * Pinned to a fixed document id, which is what makes it a singleton: no
       * "create new" button, no second copy competing to be read. The query in
       * `lib/sanity/queries.ts` looks that id up directly. Same pattern for
       * every page below.
       */
      S.listItem()
        .title("Bandeau d'annonce")
        .icon(BellIcon)
        .child(
          S.document()
            .schemaType("announcement")
            .documentId("announcement")
            .title("Bandeau d'annonce"),
        ),

      S.divider().title("Pages du site"),

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
        .title("Comment ça marche ?")
        .icon(HelpCircleIcon)
        .child(
          S.document()
            .schemaType("faqPage")
            .documentId("faqPage")
            .title("Comment ça marche ?"),
        ),

      S.divider().title("Contenus"),

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

      /**
       * Articles with their categories and authors inside, rather than those
       * two at the top level: on their own, "Rubriques" read like the site's
       * sections, and nothing said they only exist for news posts.
       */
      S.listItem()
        .title("Actualités")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Actualités")
            .items([
              S.listItem()
                .title("Articles")
                .icon(DocumentTextIcon)
                .schemaType("article")
                .child(S.documentTypeList("article").title("Articles")),
              S.divider(),
              S.listItem()
                .title("Rubriques des articles")
                .icon(TagIcon)
                .schemaType("category")
                .child(
                  S.documentTypeList("category").title(
                    "Rubriques des articles",
                  ),
                ),
              S.listItem()
                .title("Auteurs des articles")
                .icon(UsersIcon)
                .schemaType("author")
                .child(
                  S.documentTypeList("author").title("Auteurs des articles"),
                ),
            ]),
        ),

      /**
       * Alphabetical: this is a directory people scan for one name ("is Café X
       * already in?"), not a feed.
       */
      S.listItem()
        .title("Partenaires")
        .icon(PinIcon)
        .schemaType("partner")
        .child(
          S.documentTypeList("partner")
            .title("Partenaires")
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),

      S.divider(),

      S.listItem()
        .id("shopify")
        .title("Produits et livraison")
        .icon(BasketIcon)
        .child(
          S.component(ShopifyPane).id("shopify").title("Produits et livraison"),
        ),
    ]);
