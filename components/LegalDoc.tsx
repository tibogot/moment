import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { LEGAL_CONTENT_LOCALE } from "@/lib/seo";

type LegalDocProps = {
  title: string;
  lead: string;
  children: React.ReactNode;
};

/**
 * Shared shell for Belgian legal stubs. Copy is placeholder until counsel
 * fills in company details and final wording.
 */
export function LegalDoc({ title, lead, children }: LegalDocProps) {
  return (
    <>
      {/* Marked up as English whatever the URL says, or a French screen
          reader reads it aloud with French pronunciation. The navbar and
          footer stay in the page language. See LEGAL_CONTENT_LOCALE. */}
      <div lang={LEGAL_CONTENT_LOCALE} className="contents">
        <PageIntro title={title} lead={lead} />
        <GridSection className="pb-[14svh]">
          <div className="col-start-2 col-end-5 space-y-8 border-t border-sky px-(--grid-gutter) pt-[6svh] md:col-end-8">
            {children}
          </div>
        </GridSection>
      </div>
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
