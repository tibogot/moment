"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

/**
 * The client half of the Studio route, and the reason it exists as its own file.
 *
 * `sanity.config.ts` pulls in the whole `sanity` package. Imported from a Server
 * Component that lands in the RSC module graph, where `swr` — a dependency of
 * the Studio, several layers down — resolves to its `react-server` build and has
 * no default export to give. The build fails with an error naming a file nobody
 * here wrote.
 *
 * Behind `"use client"` the same import resolves through the browser condition
 * instead, which is the one the Studio was built for. Nothing else about this
 * component is worth a file of its own.
 */
export function Studio() {
  return <NextStudio config={config} />;
}
