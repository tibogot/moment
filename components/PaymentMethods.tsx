"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PaymentMethod } from "@/lib/shopify/payments";
import { cn } from "@/lib/utils";

/**
 * The accepted payment methods, read on the server (getPaymentMethods) and
 * handed to the footer and the cart, which are client components.
 */
const PaymentMethodsContext = createContext<PaymentMethod[]>([]);

export function PaymentMethodsProvider({
  methods,
  children,
}: {
  methods: PaymentMethod[];
  children: ReactNode;
}) {
  return (
    <PaymentMethodsContext.Provider value={methods}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

/**
 * A row of monochrome logos (text for a method without one, like Shop Pay),
 * labelled for screen readers. Renders nothing when Shopify could not be read.
 */
export function PaymentMethodsRow({
  label,
  className,
}: {
  /** "Paiement sécurisé" — the list's accessible name. */
  label: string;
  className?: string;
}) {
  const methods = useContext(PaymentMethodsContext);
  if (methods.length === 0) return null;

  return (
    <ul
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
    >
      {methods.map((method) => (
        <li key={method.id} className="flex items-center">
          {method.icon ? (
            // Plain img: tiny local SVGs, nothing for next/image to optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={method.icon}
              alt={method.label}
              title={method.label}
              width={20}
              height={20}
              className="h-5 w-auto opacity-80"
            />
          ) : (
            <span className="font-owners-medium text-[10px] tracking-wide uppercase opacity-80">
              {method.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
