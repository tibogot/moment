import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CartDeliverySection } from "@/components/CartDeliverySection";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { getCart } from "@/app/actions/cart";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Cart — Moment",
};

export default async function CartPage() {
  const [cart, availability] = await Promise.all([
    getCart(),
    getDeliveryAvailability(),
  ]);
  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <>
      <PageIntro title="Cart" />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          {isEmpty ? (
            <>
              <p className="font-archivo-light text-[15px]">
                Your cart is empty.
              </p>
              <Link
                href={routes.shop}
                className="font-owners-medium mt-6 inline-block border border-black px-8 py-4 text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
              >
                Browse the shop
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
                      className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-sky/20"
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
                        <p className="font-archivo-light mt-1 text-[13px]">
                          Quantity {line.quantity}
                        </p>
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
                deliveryDate={cart.deliveryDate}
                totalPrice={cart.totalPrice}
                checkoutUrl={cart.checkoutUrl}
              />
            </>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
