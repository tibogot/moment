import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "./env";

/**
 * Built from the project id and dataset, not from `sanityClient`.
 *
 * An image URL needs nothing else, and this module is imported by client
 * components (the home page's flip panels). Built on the client, it pulled the
 * whole of `next-sanity`'s client — about 109 KB — into the browser bundle to
 * format a URL.
 */
const builder = createImageUrlBuilder({
  projectId: sanityProjectId,
  dataset: sanityDataset,
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
