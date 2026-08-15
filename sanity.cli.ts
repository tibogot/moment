import { defineCliConfig } from "sanity/cli";
import { sanityDataset, sanityProjectId } from "@/lib/sanity/env";

/**
 * For the `sanity` CLI only — schema deploys, dataset exports, TypeGen. The
 * Studio itself is served by Next at /studio and is not built or deployed by
 * this config, so there is no `sanity build` or `sanity deploy` in the scripts.
 */
export default defineCliConfig({
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
