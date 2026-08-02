import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { isCustomerAccountConfigured } from "@/lib/shopify/customer-account/config";
import { isCustomerLoggedIn } from "@/lib/shopify/customer-account/session";

export const metadata: Metadata = {
  title: "Sign in — Moment",
};

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  if (await isCustomerLoggedIn()) redirect(routes.account);

  const configured = isCustomerAccountConfigured();

  return (
    <>
      <PageIntro
        title="Sign in"
        lead="Sign in with your Shopify customer account to see your orders and speed up checkout."
      />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-6">
          {error === "auth_failed" && (
            <p className="font-archivo-light mb-6 text-[14px]">
              Sign in failed. Please try again.
            </p>
          )}

          {configured ? (
            <a
              href={routes.authLogin}
              className="group inline-block border border-sky bg-cream px-3 py-2.5 transition-colors duration-500 hover:bg-sky"
            >
              <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                Continue with Shopify
                <span
                  className="transition-transform duration-500 group-hover:translate-x-1.5"
                  aria-hidden
                >
                  &rarr;
                </span>
              </span>
            </a>
          ) : (
            <p className="font-archivo-light text-[15px]">
              Customer accounts are not configured yet.
            </p>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
