import { frFRLocale } from "@sanity/locale-fr-fr";
import { visionTool } from "@sanity/vision";
import { defineConfig, defineLocaleResourceBundle } from "sanity";
import { structureTool } from "sanity/structure";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/lib/sanity/env";
import { hasSitePage, ViewOnSiteAction } from "@/sanity/actions/viewOnSite";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

/**
 * The Studio the client edits in, mounted by `app/studio/[[...tool]]`.
 *
 * The project id and dataset come from `lib/sanity/env` rather than being
 * written here: the site already reads them from there, and a Studio pointed at
 * one dataset while the site reads another is a failure that looks exactly like
 * "my changes are not showing up".
 */
const SINGLETONS = [
  "homePage",
  "eventsPage",
  "coffeePage",
  "faqPage",
  "announcement",
  "practicalInfo",
] as const;

export default defineConfig({
  name: "default",
  title: "Moment",
  // At the root when Sanity hosts it (sanity.cli.ts), under /studio in Next.
  basePath: process.env.SANITY_STUDIO_HOSTED === "true" ? "/" : "/studio",

  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,

  /**
   * The Studio speaks French because the person editing in it does.
   * `frFRLocale` is a plugin, not an `i18n.bundles` entry — it translates the
   * chrome Sanity owns (Publish, Review changes, validation messages), and the
   * field titles and descriptions in `sanity/schemaTypes` cover the rest.
   *
   * What stays English is the type and field *names* (`menu`, `pricePerPerson`).
   * Those are the data contract shared with the GROQ projections and the
   * TypeScript types; they are not shown to anyone.
   */
  plugins: [
    frFRLocale(),
    structureTool({ structure }),
    // Vision (raw GROQ queries) is a developer tool: kept on `next dev`,
    // absent from the deployed Studio, where it would only be a screen of code
    // in the client's top bar.
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],

  /**
   * Content Releases (bundling edits to publish together on a date) is for
   * editorial teams. Here it would only add "versions" and "release drafts"
   * next to the plain Publish button a caterer needs.
   */
  releases: { enabled: false },

  /**
   * An empty list says "Aucun document de ce type" by default, which reads as
   * "something is missing" to someone who has never created one. Partenaires
   * and Réalisations start empty, so the message says what to do instead.
   * Sanity has one empty-list text for every list, not one per type: what each
   * list is for is written on the first field of its form.
   */
  i18n: {
    bundles: [
      defineLocaleResourceBundle({
        locale: "fr-FR",
        namespace: "structure",
        resources: {
          "panes.document-list-pane.no-documents-of-type.text":
            "Rien ici pour l'instant. Cliquez sur le crayon en haut de cette colonne pour créer le premier.",
        },
      }),
    ],
  },

  schema: {
    types: schemaTypes,
  },

  /**
   * Singletons — `sanity/structure.ts` pins each to a fixed document id and the
   * queries read those ids directly. Leaving them in the global "create" menu
   * would let someone make a second one that nothing ever reads, then wonder
   * why their new phone number never appears.
   */
  document: {
    // "Voir sur le site" on every document that has a page — see the action.
    actions: (previous, context) =>
      hasSitePage(context.schemaType)
        ? [...previous, ViewOnSiteAction]
        : previous,
    // `menu` too, since the menus left the site (27 November 2026): its
    // documents are kept, but nobody should start a new one.
    newDocumentOptions: (previous) =>
      previous.filter(
        (item) =>
          item.templateId !== "menu" &&
          !SINGLETONS.includes(item.templateId as (typeof SINGLETONS)[number]),
      ),
  },
});
