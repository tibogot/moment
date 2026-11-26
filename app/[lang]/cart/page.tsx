import { CdnImage as Image } from "@/components/CdnImage";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CartDeliverySection } from "@/components/CartDeliverySection";
import { CartLineControls } from "@/components/CartLineControls";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCart } from "@/app/actions/cart";
import { getDeliveryRules } from "@/lib/shopify/zones";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("cart", {
  path: routes.cart,
  noindex: true,
});

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [cart, { availability, zones, slots, pickupSlots }, dict] =
    await Promise.all([
      getCart(toLocale(lang), { clearStale: false }),
      getDeliveryRules(),
      getDictionary(toLocale(lang)),
    ]);
  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <>
      <PageIntro title={dict.cart.title} />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          {isEmpty ? (
            <>
              <p className="font-archivo-light text-[15px]">
                {dict.cart.empty}
              </p>
              <Link
                href={routes.shop}
                className="group mt-6 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
              >
                <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
                  {dict.cart.browseShop}
                  <span
                    className="transition-transform duration-500 group-hover:translate-x-1.5"
                    aria-hidden
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            </>
          ) : (
            <>
              <ul>
                {cart.lines.map((line) => (
                  <li
                    key={line.id}
                    className="flex gap-5 border-t border-sky py-6"
                  >
                    <Link
                      href={routes.product(line.productHandle)}
                      className="relative aspect-4/5 w-24 shrink-0 overflow-hidden bg-sky/20"
                    >
                      {line.imageUrl && (
                        <Image
                          src={line.imageUrl}
                          alt={line.imageAlt}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex flex-1 flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={routes.product(line.productHandle)}
                          className="font-owners-medium text-[13px] uppercase tracking-wide"
                        >
                          {line.title}
                        </Link>
                        <CartLineControls
                          lineId={line.id}
                          quantity={line.quantity}
                          minimum={zones.minimumPiecesPerProduct}
                        />
                      </div>
                      <span className="font-archivo-light text-[13px]">
                        {line.lineTotal}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <CartDeliverySection
                availability={availability}
                zones={zones}
                slots={slots}
                pickupSlots={pickupSlots}
                deliveryDate={cart.deliveryDate}
                deliverySlot={cart.deliverySlot}
                deliveryMethod={cart.deliveryMethod}
                deliveryAddress={cart.deliveryAddress}
                deliveryNote={cart.deliveryNote}
                deliveryZone={cart.deliveryZone}
                lines={cart.lines}
                subtotal={cart.subtotal}
                totalPrice={cart.totalPrice}
              />
            </>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
