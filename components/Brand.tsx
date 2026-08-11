import { siteConfig } from "@/lib/site";

/**
 * The company name, marked so browsers leave it alone.
 *
 * Chrome's built-in translate rewrites text nodes wherever it finds them, and
 * "Moment" is an ordinary Dutch word — a visitor reading the site through the
 * translate bar would find the business renamed "Ogenblik" in the footer, the
 * legal notice and the terms of sale. A registered company name in a legal
 * notice is not a phrase to be helpfully rendered.
 *
 * `translate="no"` is the standard HTML attribute for this and every browser
 * that offers translation honours it.
 */
export function Brand({ name }: { name?: string }) {
  return <span translate="no">{name || siteConfig.name}</span>;
}
