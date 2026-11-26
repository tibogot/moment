import { unstable_cache } from "next/cache";
import { isShopifyConfigured, storefrontRequest } from "./client";
import {
  SHOPIFY_CACHE_TAG,
  SHOPIFY_CACHE_VERSION,
  SHOPIFY_REVALIDATE,
} from "./products";

/**
 * The payment methods the checkout accepts, for the logos in the footer and
 * the cart (26 November 2026). Read from Shopify rather than typed here, so
 * turning a method on or off in the admin is reflected without a developer.
 *
 * What the Storefront API reports: card brands and wallets. Local methods —
 * Bancontact, the one Belgian buyers look for — are not in it, so they are
 * listed by hand in `LOCAL_METHODS` once confirmed in Settings → Payments.
 */
export type PaymentMethod = {
  id: string;
  label: string;
  /** A monochrome logo in public/brand/payments, or none (shown as text). */
  icon: string | null;
};

const KNOWN: Record<string, PaymentMethod> = {
  VISA: { id: "visa", label: "Visa", icon: "/brand/payments/visa.svg" },
  MASTERCARD: {
    id: "mastercard",
    label: "Mastercard",
    icon: "/brand/payments/mastercard.svg",
  },
  AMERICAN_EXPRESS: {
    id: "amex",
    label: "American Express",
    icon: "/brand/payments/americanexpress.svg",
  },
  APPLE_PAY: {
    id: "applepay",
    label: "Apple Pay",
    icon: "/brand/payments/applepay.svg",
  },
  GOOGLE_PAY: {
    id: "googlepay",
    label: "Google Pay",
    icon: "/brand/payments/googlepay.svg",
  },
  SHOPIFY_PAY: { id: "shoppay", label: "Shop Pay", icon: null },
};

/**
 * Methods the API does not report. Add Bancontact here the day it is
 * confirmed active — `{ id: "bancontact", label: "Bancontact", icon: null }` —
 * first in the list: it is the one a Belgian customer looks for.
 */
const LOCAL_METHODS: PaymentMethod[] = [];

type PaymentSettingsResponse = {
  shop: {
    paymentSettings: {
      acceptedCardBrands: string[];
      supportedDigitalWallets: string[];
    };
  };
};

const PAYMENT_SETTINGS_QUERY = /* GraphQL */ `
  query PaymentSettings {
    shop {
      paymentSettings {
        acceptedCardBrands
        supportedDigitalWallets
      }
    }
  }
`;

const cachedPaymentMethods = unstable_cache(
  async (): Promise<PaymentMethod[]> => {
    const data = await storefrontRequest<PaymentSettingsResponse>(
      PAYMENT_SETTINGS_QUERY,
      {},
    );
    const { acceptedCardBrands, supportedDigitalWallets } =
      data.shop.paymentSettings;
    const reported = [...acceptedCardBrands, ...supportedDigitalWallets]
      .map((code) => KNOWN[code])
      .filter((method): method is PaymentMethod => Boolean(method));
    return [...LOCAL_METHODS, ...reported];
  },
  ["shopify-payment-methods", SHOPIFY_CACHE_VERSION],
  { revalidate: SHOPIFY_REVALIDATE, tags: [SHOPIFY_CACHE_TAG] },
);

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (!isShopifyConfigured()) return [];
  try {
    return await cachedPaymentMethods();
  } catch (error) {
    // No logos rather than a broken footer.
    console.error("[shopify] getPaymentMethods failed", error);
    return [];
  }
}
