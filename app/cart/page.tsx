import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { getCart } from "@/app/actions/cart";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Cart — Moment",
};

export default async function CartPage() {
  const cart = await getCart();
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

              <div className="flex items-baseline justify-between border-t border-sky pt-6">
                <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                  Total
                </span>
                <span className="font-archivo-light text-[15px]">
                  {cart.totalPrice}
                </span>
              </div>

              <a
                href={cart.checkoutUrl}
                className="font-owners-medium mt-8 inline-block bg-black px-8 py-4 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
              >
                Checkout
              </a>
            </>
          )}
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
