import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

type LegalDocProps = {
  locale: Locale;
  title: string;
  lead: string;
  children: React.ReactNode;
};

const LAST_UPDATED_LABEL: Record<Locale, string> = {
  fr: "Dernière mise à jour :",
  nl: "Laatst bijgewerkt:",
  en: "Last updated:",
};

/**
 * Shared shell for the legal pages — legal notice, privacy, cookies, terms and
 * shipping. Each page carries its own copy in all three languages; this only
 * lays it out and dates it.
 */
export function LegalDoc({ locale, title, lead, children }: LegalDocProps) {
  return (
    <>
      <PageIntro title={title} lead={lead} />
      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 space-y-8 border-t border-sky px-(--grid-gutter) pt-[6svh] md:col-end-8">
          {children}
          <p className="font-archivo-light text-[12px] text-black/50">
            {LAST_UPDATED_LABEL[locale]}{" "}
            {new Date(`${LEGAL_LAST_UPDATED}T00:00:00Z`).toLocaleDateString(
              INTL_LOCALE[locale],
              { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
            )}
          </p>
        </div>
      </GridSection>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
        {title}
      </h2>
      <div className="font-archivo-light mt-3 space-y-3 text-[15px] leading-normal text-black/80">
        {children}
      </div>
    </section>
  );
}

/** A plain bulleted list in the legal body style. */
export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

/** An outbound link in legal copy — underlined, opens in a new tab. */
/** A string in each of the site's languages — the legal pages' copy tables. */
export type Localized = Record<Locale, string>;

/** The legal pages' link style, for the internal links they render themselves. */
export const legalLinkClassName =
  "underline underline-offset-2 transition-opacity hover:opacity-60";

export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      className={legalLinkClassName}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
