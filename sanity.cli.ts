import { defineCliConfig } from "sanity/cli";

/*
 * The Studio is also hosted by Sanity (27 November 2026), at
 * https://moment-lab.sanity.studio, so people can edit without access to the
 * private test site: `npx sanity deploy`, logged in with an account that
 * administers the project. Built that way it sits at the root of its
 * address, not under /studio — sanity.config.ts reads this flag. Next, which
 * serves the same Studio at /studio, never loads this file.
 */
process.env.SANITY_STUDIO_HOSTED = "true";
import { sanityDataset, sanityProjectId } from "@/lib/sanity/env";

/**
 * For the `sanity` CLI — schema deploys, dataset exports, TypeGen, and the
 * hosted copy of the Studio (`sanity deploy`, above). The site's own Studio
 * is served by Next at /studio.
 */
export default defineCliConfig({
  studioHost: "moment-lab",
  // The hosted Studio's id, so `sanity deploy` updates it without asking.
  deployment: { appId: "bxeelgyog7vbhralw7z9hlfd" },
  api: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
  },
  /**
   * Left off `enabled`, which would regenerate during `sanity dev` / `sanity
   * build` — neither of which this project runs, since Next serves the Studio.
   * `npm run typegen` is the whole workflow. Run it after touching a schema or
   * a query; the generated file is committed, so a fresh clone type-checks
   * without it.
   */
  typegen: {
    path: "./{app,lib,components,sanity}/**/*.{ts,tsx}",
    schema: "schema.json",
    generates: "./sanity.types.ts",
  },
});
