import type { StyleSpecification } from "maplibre-gl";

/**
 * Geoapify's "positron" vector style, recoloured in the site's colours: the
 * cream ground, no buildings, the main roads in sky blue and everything else
 * in paler blues — a drawn plan rather than a grey street map. (A version
 * with the sky blue as the ground was tried and read as overcharged.)
 *
 * The style is fetched as it is published and rewritten layer by layer, by id,
 * rather than copied into the repo: Geoapify keeps the tiles, sources and
 * glyph URLs it points to in step with its own servers, and a frozen copy
 * would drift from them. A layer id this file does not know keeps Geoapify's
 * own (light grey) look, which is the safe way to fail.
 */
export const MAP_COLORS = {
  ground: "#f8f7f2", // the site's cream
  majorRoad: "#a7c5ee", // the site's sky
  water: "#a7c5ee",
  park: "#d9e6f7", // sky, very light
  minorRoad: "#e2ebf8", // sky, paler still: visible on cream, never grey
  rail: "#dbe5f4",
  edge: "#e7e5dd",
  label: "#000000",
} as const;

type Paint = Record<string, unknown>;

const MAJOR = /motorway|major/;

/**
 * Paint overrides per layer; `null` hides the layer. Matched on type first:
 * ids share prefixes across types ("highway_minor" is a line,
 * "highway_name_other" its street names), and a paint property of the wrong
 * type makes MapLibre reject the whole style.
 */
function paintFor(id: string, type: string): Paint | null | undefined {
  const c = MAP_COLORS;
  if (type === "symbol") return labelPaint(id);

  if (id === "background") return { "background-color": c.ground };
  if (id === "water") return { "fill-color": c.water, "fill-opacity": 1 };
  if (id === "waterway") return { "line-color": c.water };
  if (id === "park" || id === "landcover_wood")
    return { "fill-color": c.park, "fill-opacity": 1 };
  // Residential blocks and buildings are what made Geoapify's own look grey.
  if (id === "landuse_residential")
    return { "fill-color": c.ground, "fill-opacity": 1 };
  if (id === "building") return null;

  // Ice, glaciers and airports: nothing in Brussels a visitor is looking for.
  if (id.startsWith("landcover_ice") || id === "landcover_glacier") return null;
  if (id.startsWith("aeroway")) return null;

  if (id.startsWith("railway")) return { "line-color": c.rail };
  if (id.startsWith("boundary")) return { "line-color": c.edge };

  if (id.endsWith("_casing")) return { "line-color": c.ground };
  if (id.startsWith("highway") || id.startsWith("tunnel_"))
    return { "line-color": MAJOR.test(id) ? c.majorRoad : c.minorRoad };

  return undefined;
}

function labelPaint(id: string): Paint | undefined {
  const c = MAP_COLORS;
  if (id === "water_name")
    return { "text-color": c.label, "text-opacity": 0.5, "text-halo-width": 0 };
  if (id.startsWith("highway_name") || id.startsWith("place"))
    return {
      "text-color": c.label,
      "text-opacity": id.startsWith("highway_name") ? 0.6 : 0.85,
      "text-halo-color": c.ground,
      "text-halo-width": 1.2,
    };
  return undefined;
}

export function brandStyle(style: StyleSpecification): StyleSpecification {
  const layers = style.layers.flatMap((layer) => {
    const paint = paintFor(layer.id, layer.type);
    if (paint === null) return [];
    if (!paint) return [layer];
    return [
      { ...layer, paint: { ...(layer as { paint?: Paint }).paint, ...paint } },
    ] as typeof style.layers;
  });
  return { ...style, layers };
}
