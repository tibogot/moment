import { frFRLocale } from "@sanity/locale-fr-fr";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/lib/sanity/env";
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
const SINGLETONS = ["siteSettings", "homePage"] as const;

export default defineConfig({
  name: "default",
  title: "Moment",
  basePath: "/studio",

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
  plugins: [frFRLocale(), structureTool({ structure }), visionTool()],

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
    newDocumentOptions: (previous) =>
      previous.filter(
        (item) =>
          !SINGLETONS.includes(item.templateId as (typeof SINGLETONS)[number]),
      ),
  },
});
