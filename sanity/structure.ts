import type { StructureResolver } from "sanity/structure";
import { BasketIcon } from "@sanity/icons/Basket";
import { BellIcon } from "@sanity/icons/Bell";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { CaseIcon } from "@sanity/icons/Case";
import { BookIcon } from "@sanity/icons/Book";
import { ClockIcon } from "@sanity/icons/Clock";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { OlistIcon } from "@sanity/icons/Olist";
import { HomeIcon } from "@sanity/icons/Home";
import { PinIcon } from "@sanity/icons/Pin";
import { TagIcon } from "@sanity/icons/Tag";
import { UsersIcon } from "@sanity/icons/Users";
import { GuidePane } from "@/sanity/components/GuidePane";
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
 * - "Mode d'emploi" first: the owners' manual, for a site handed over without
 *   maintenance (sanity/components/GuidePane.tsx);
 * - the announcement bar next — the most frequent edit, and the one made in a
 *   hurry ("fermé demain");
 * - "Pages du site": one entry per page, in the order of the site's menu;
 * - "Contenus": the lists that grow — the map's partners, the reviews, the
 *   news — named as on the site ("Où nous trouver", 27 November 2026);
 * - "Produits et livraison": a signpost to Shopify, where the first thing an
 *   owner looks for actually lives.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Moment")
    .items([
      S.listItem()
        .id("guide")
        .title("Mode d'emploi")
        .icon(BookIcon)
        .child(S.component(GuidePane).id("guide").title("Mode d'emploi")),

      S.divider(),

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

      // Phone, e-mail, hours, social — the facts that change without
      // warning. Next to the bar: both are the "quick fix" entries.
      S.listItem()
        .title("Infos pratiques")
        .icon(ClockIcon)
        .child(
          S.document()
            .schemaType("practicalInfo")
            .documentId("practicalInfo")
            .title("Infos pratiques"),
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
        .title("Page Événements")
        .icon(CalendarIcon)
        .child(
          S.document()
            .schemaType("eventsPage")
            .documentId("eventsPage")
            .title("Page Événements"),
        ),

      S.listItem()
        .title("Page Comptoir café")
        .icon(CaseIcon)
        .child(
          S.document()
            .schemaType("coffeePage")
            .documentId("coffeePage")
            .title("Page Comptoir café"),
        ),

      S.listItem()
        .title("Comment ça marche & FAQ")
        .icon(OlistIcon)
        .child(
          S.document()
            .schemaType("faqPage")
            .documentId("faqPage")
            .title("Comment ça marche & FAQ"),
        ),

      S.divider().title("Contenus"),

      // "Menus traiteur" left the sidebar on 27 November 2026 with the menus
      // pages (the owners dropped them). The `menu` type and its documents are
      // kept, so bringing it back is this list item and the redirect in
      // next.config.ts:
      //   S.listItem().title("Menus traiteur").icon(UlistIcon)
      //     .schemaType("menu")
      //     .child(S.documentTypeList("menu").title("Menus traiteur")),

      // "Réalisations" left the sidebar on 27 November 2026: no page shows
      // them yet, so a réalisation filled in led nowhere. The `pastEvent` type
      // is kept; bringing it back is this item (ordered by date, newest first)
      // and a page that renders them:
      //   S.listItem().title("Réalisations").icon(ImagesIcon)
      //     .schemaType("pastEvent")
      //     .child(S.documentTypeList("pastEvent").title("Réalisations")
      //       .defaultOrdering([{ field: "date", direction: "desc" }])),

      /**
       * Alphabetical: this is a directory people scan for one name ("is Café X
       * already in?"), not a feed. Named after the page it fills.
       */
      S.listItem()
        .title("Où nous trouver (partenaires)")
        .icon(PinIcon)
        .schemaType("partner")
        .child(
          S.documentTypeList("partner")
            .title("Où nous trouver (partenaires)")
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),

      /** In the order the home page shows them. */
      S.listItem()
        .title("Avis clients")
        .icon(CommentIcon)
        .schemaType("testimonial")
        .child(
          S.documentTypeList("testimonial")
            .title("Avis clients")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
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

      S.divider(),

      S.listItem()
        .id("shopify")
        .title("Produits et livraison")
        .icon(BasketIcon)
        .child(
          S.component(ShopifyPane).id("shopify").title("Produits et livraison"),
        ),
    ]);
