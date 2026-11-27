import type { ImageRule, ValidationContext } from "sanity";
import { sanityApiVersion } from "@/lib/sanity/env";

/**
 * The checks on a page photo (27 November 2026). The site never sends the
 * original: the CDN resizes it and serves WebP or AVIF, so a heavy file only
 * costs upload time. The real risk is the opposite — a screenshot or a photo
 * received by WhatsApp, enlarged and blurry on a large screen.
 *
 * - Too small: a warning (orange), never a block — the owners can still
 *   publish, they are just told.
 * - Too heavy: an error above 25 MB, the raw camera file that takes ages to
 *   upload and is never needed.
 */
const MAX_MB = 25;

type AssetFacts = { size?: number; width?: number } | null;

async function assetFacts(
  value: { asset?: { _ref?: string } } | undefined,
  context: ValidationContext,
): Promise<AssetFacts> {
  const id = value?.asset?._ref;
  if (!id) return null;
  return context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<AssetFacts>(
      `*[_id == $id][0]{ size, "width": metadata.dimensions.width }`,
      { id },
    );
}

/**
 * `minWidth`: the width under which the photo looks soft where it sits —
 * 2400 px for the full-screen opening photo, 1600 px elsewhere.
 */
export function photoRules(minWidth = 1600) {
  return (rule: ImageRule) => [
    rule
      .custom(async (value, context) => {
        const facts = await assetFacts(value, context);
        if (!facts?.width || facts.width >= minWidth) return true;
        return `Cette photo est petite (${facts.width} px de large) : elle risque d'être floue sur grand écran. Idéalement ${minWidth} px ou plus — envoyez l'original, pas une capture d'écran ni une photo reçue par WhatsApp.`;
      })
      .warning(),
    rule.custom(async (value, context) => {
      const facts = await assetFacts(value, context);
      if (!facts?.size) return true;
      const mb = facts.size / (1024 * 1024);
      if (mb <= MAX_MB) return true;
      return `Cette photo pèse ${Math.round(mb)} Mo : le maximum est ${MAX_MB} Mo. Exportez-la en JPEG depuis votre ordinateur ou votre téléphone — le site la compresse ensuite tout seul.`;
    }),
  ];
}
