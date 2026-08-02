import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { getCustomerProfile } from "@/lib/shopify/customer-account/customer";
import { getCustomerDisplayName } from "@/lib/shopify/customer-account/display-name";
import { isCustomerLoggedIn } from "@/lib/shopify/customer-account/session";

export const metadata: Metadata = pageMetadata({
  title: "Account",
  description: "Your Moment account and order history.",
  path: routes.account,
  noindex: true,
});

function formatOrderTotal(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export default async function AccountPage() {
  if (!(await isCustomerLoggedIn())) redirect(routes.signIn);

  const profile = await getCustomerProfile();

  if (!profile.ok || !profile.customer) redirect(routes.signIn);

  const { customer, orders } = profile;

  return (
    <>
      <PageIntro
        title="Account"
        lead={`Signed in as ${getCustomerDisplayName(customer)}.`}
      />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
            Orders
          </h2>

          {orders.length === 0 ? (
            <p className="font-archivo-light mt-5 text-[15px]">
              No orders yet.
            </p>
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
                    {new Date(order.processedAt).toLocaleDateString("en-BE")}
                  </span>
                  <span className="font-archivo-light text-[13px]">
                    {formatOrderTotal(
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
            Sign out
          </a>
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
