import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { formatPriceAmount, formatShortDate } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getCustomerProfile } from "@/lib/shopify/customer-account/customer";
import { getCustomerDisplayName } from "@/lib/shopify/customer-account/display-name";
import { isCustomerLoggedIn } from "@/lib/shopify/customer-account/session";

export const generateMetadata = localizedMetadata("account", {
  path: routes.account,
  noindex: true,
});

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  if (!(await isCustomerLoggedIn())) redirect(routes.signIn);

  const locale = toLocale((await params).lang);
  const [profile, dict] = await Promise.all([
    getCustomerProfile(),
    getDictionary(locale),
  ]);

  if (!profile.ok || !profile.customer) redirect(routes.signIn);

  const { customer, orders } = profile;
  const t = dict.account;

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
                <li
                  key={order.id}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-t border-sky py-4"
                >
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
                </li>
              ))}
            </ul>
          )}

          <a
            href={routes.authLogout}
            className="font-owners-medium mt-10 inline-block border border-black px-8 py-4 text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
          >
            {t.signOut}
          </a>
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
