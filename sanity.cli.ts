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
});
