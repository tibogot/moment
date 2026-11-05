import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { ReorderButton } from "@/components/ReorderButton";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { formatPriceAmount, formatShortDate } from "@/lib/i18n/format";
import { href, refreshSessionHref, routes, signOutHref } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCustomerProfile } from "@/lib/shopify/customer-account/customer";
import { getCustomerDisplayName } from "@/lib/shopify/customer-account/display-name";
import { sessionIsExpiring } from "@/lib/shopify/customer-account/auth";
import { getCustomerSession } from "@/lib/shopify/customer-account/session";

export const generateMetadata = localizedMetadata("account", {
  path: routes.account,
  noindex: true,
});

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);

  // Through `href`: a bare /signin goes via the proxy, which only knows French.
  const session = await getCustomerSession();
  if (!session) redirect(href(locale, routes.signIn));

  // A page cannot save a refreshed token, so an expiring one takes a detour
  // through the route that can, and comes straight back.
  if (sessionIsExpiring(session)) {
    redirect(refreshSessionHref(locale, routes.account));
  }

  const [profile, dict] = await Promise.all([
    getCustomerProfile(),
    getDictionary(locale),
  ]);

  // Refused: drop the session and ask them to sign in again. Sending them to
  // sign-in with the cookie still set was a loop — sign-in sees a session and
  // sends them straight back here.
  if (!profile.ok && profile.error === "not_authenticated") {
    redirect(refreshSessionHref(locale, routes.signIn, { reset: true }));
  }

  // Anything else is Shopify having a bad moment, not the customer's session:
  // the error page offers a retry rather than a sign-in they do not need.
  if (!profile.ok || !profile.customer) {
    throw new Error(
      `Customer account unavailable: ${profile.ok ? "no customer" : profile.error}`,
    );
  }

  const { customer, orders } = profile;
  const t = dict.account;
  const reorderLabels = {
    reorder: t.reorder,
    reordering: t.reordering,
    skipped: t.reorderSkipped,
    nothingLeft: t.reorderNothingLeft,
    failed: t.reorderFailed,
    goToCart: t.goToCart,
  };

  return (
    <>
      <PageIntro
        title={t.title}
        lead={interpolate(t.signedInAs, {
          name: getCustomerDisplayName(customer),
        })}
      />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
            {t.orders}
          </h2>

          {orders.length === 0 ? (
            <p className="font-archivo-light mt-5 text-[15px]">{t.noOrders}</p>
          ) : (
            <ul className="mt-5">
              {orders.map((order) => (
                <li key={order.id} className="border-t border-sky py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-owners-medium text-[13px] uppercase tracking-wide">
                      {order.name}
                    </span>
                    <span className="font-archivo-light text-[13px]">
                      {formatShortDate(locale, order.processedAt)}
                    </span>
                    <span className="font-archivo-light text-[13px]">
                      {formatPriceAmount(
                        locale,
                        order.totalPrice.amount,
                        order.totalPrice.currencyCode,
                      )}
                    </span>
                  </div>

                  {order.lineItems.nodes.length > 0 && (
                    <p className="font-archivo-light mt-2 text-[13px] opacity-70">
                      {order.lineItems.nodes
                        .map((line) => `${line.quantity} × ${line.name}`)
                        .join(" · ")}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-start gap-5">
                    <ReorderButton orderId={order.id} labels={reorderLabels} />
                    {order.statusPageUrl && (
                      <a
                        href={order.statusPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-owners-medium py-2.5 text-[11px] uppercase tracking-wide underline transition-opacity hover:opacity-60"
                      >
                        {t.orderDetails}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* A form, not a link: a link can be fired by any page on the web —
              an <img> pointing at it signed the customer out. A cross-site
              POST carries no session cookie (it is SameSite=Lax). */}
          <form method="post" action={signOutHref(locale)} className="mt-10">
            <button
              type="submit"
              className="font-owners-medium inline-block border border-black px-8 py-4 text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
            >
              {t.signOut}
            </button>
          </form>
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
