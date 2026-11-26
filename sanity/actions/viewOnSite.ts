import { LaunchIcon } from "@sanity/icons/Launch";
import type { DocumentActionComponent, SanityDocument } from "sanity";

/**
 * "Voir sur le site": opens the page a document appears on, in a new tab.
 *
 * Published version only: the site never shows drafts, so a link built from a
 * draft slug would land on a 404 and read as "my change broke the site". With
 * nothing published yet the action is shown disabled, with the reason.
 *
 * The origin is the Studio's own: it is mounted at /studio on the site, so the
 * button points at localhost in development and at the live domain in
 * production, with nothing to configure at launch.
 *
 * Types with no page of their own (rubriques, auteurs) have no entry and get
 * no button. Réalisations get one once a page actually shows them.
 */
const PATHS: Record<string, (doc: SanityDocument) => string | null> = {
  homePage: () => "/fr",
  announcement: () => "/fr",
  practicalInfo: () => "/fr/contact",
  testimonial: () => "/fr",
  faqPage: () => "/fr/faq",
  partner: () => "/fr/find-us",
  menu: (doc) => {
    const slug = (doc.slug as { current?: string } | undefined)?.current;
    return slug ? `/fr/menus/${slug}` : null;
  },
  // One document per language: the article lives under its own one.
  article: (doc) => {
    const slug = (doc.slug as { current?: string } | undefined)?.current;
    const language = (doc.language as string | undefined) ?? "fr";
    return slug ? `/${language}/news/${slug}` : null;
  },
};

export function hasSitePage(type: string) {
  return type in PATHS;
}

export const ViewOnSiteAction: DocumentActionComponent = ({
  type,
  published,
}) => {
  const path = published ? PATHS[type]?.(published) : null;

  return {
    label: "Voir sur le site",
    icon: LaunchIcon,
    disabled: !path,
    title: path
      ? "Ouvre la page publiée dans un nouvel onglet."
      : "Publiez d'abord : le site n'affiche que la version publiée.",
    onHandle: () => {
      if (path) window.open(`${window.location.origin}${path}`, "_blank");
    },
  };
};
