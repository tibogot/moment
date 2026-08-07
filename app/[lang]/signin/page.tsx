import { redirect } from "next/navigation";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { isCustomerAccountConfigured } from "@/lib/shopify/customer-account/config";
import { isCustomerLoggedIn } from "@/lib/shopify/customer-account/session";

export const generateMetadata = localizedMetadata("signin", {
  path: routes.signIn,
  noindex: true,
});

type SignInPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
};

/**
 * The arrow on both CTAs. `<a>` rather than Link for the OAuth handoff: it
 * leaves the app for Shopify's hosted login, and a client navigation cannot.
 */
function Arrow() {
  return (
    <span
      className="transition-transform duration-500 group-hover:translate-x-1.5"
      aria-hidden
    >
      &rarr;
    </span>
  );
}

/**
 * Two doors onto one account system.
 *
 * Personal and professional customers sign in through exactly the same Shopify
 * OAuth — what differs is what the account shows them afterwards, which is
 * decided by a `pro` tag on the Shopify customer. The split here is a wayfinding
 * device, not two systems: a company arriving to order lunch should not have to
 * guess whether the personal login is meant for them.
 *
 * Both are links out rather than forms. Shopify's customer accounts host the
 * login page themselves, so there is no password box to put on this page even
 * if we wanted one — see buildAuthorizationUrl.
 */
export default async function SignInPage({
  params,
  searchParams,
}: SignInPageProps) {
  const { lang } = await params;
  const { error } = await searchParams;

  if (await isCustomerLoggedIn()) redirect(routes.account);

  const dict = await getDictionary(toLocale(lang));
  const t = dict.signIn;
  const configured = isCustomerAccountConfigured();

  return (
    <>
      <PageIntro title={t.title} />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          {error === "auth_failed" && (
            <p role="alert" className="font-archivo-light mb-8 text-[15px]">
              {t.failed}
            </p>
          )}

          {configured ? (
            <div className="grid border-t border-sky md:grid-cols-2">
              <section className="border-b border-sky py-[5svh] md:border-b-0 md:border-r md:pr-(--grid-gutter)">
                <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
                  {t.personalTitle}
                </h2>
                <p className="font-archivo-light mt-3 max-w-[38ch] text-[18px] leading-normal">
                  {t.personalBody}
                </p>

                <a
                  href={routes.authLogin}
                  className="group mt-6 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
                >
                  <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                    {t.personalCta}
                    <Arrow />
                  </span>
                </a>
              </section>

              <section className="py-[5svh] md:pl-(--grid-gutter)">
                <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
                  {t.proTitle}
                </h2>
                <p className="font-archivo-light mt-3 max-w-[38ch] text-[18px] leading-normal">
                  {t.proBody}
                </p>

                {/* The same OAuth. An approved company is a Shopify customer
                    like any other; the tag is what changes their account. */}
                <a
                  href={routes.authLogin}
                  className="group mt-6 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
                >
                  <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                    {t.proCta}
                    <Arrow />
                  </span>
                </a>

                <p className="font-archivo-light mt-5 text-[15px] leading-normal">
                  {t.proNew}{" "}
                  <Link
                    href={routes.proAccount}
                    className="underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    {t.proNewCta}
                  </Link>
                </p>
              </section>
            </div>
          ) : (
            <p className="font-archivo-light text-[15px]">{t.notConfigured}</p>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
