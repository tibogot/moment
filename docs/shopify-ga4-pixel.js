// Moment — Google Analytics 4 purchase pixel.
//
// Paste this whole file into Shopify admin → Settings → Customer events →
// Add custom pixel ("Moment GA4"). Customer privacy → Permission: "Not
// required" — consent was collected on moment-lab.be, and this pixel enforces
// it itself: it only sends when the cart carries the visitor's GA client id,
// which the site writes only for visitors who accepted analytics (see
// lib/analytics.ts and beginCheckout in app/actions/cart.ts).
//
// The purchase is sent with that client id and session id, so GA attributes
// it to the same visitor and the same visit that browsed the site — the
// checkout is on another domain, and without this it would read as a new
// visitor arriving from nowhere.
//
// Verify after the first test order: GA4 → Reports → Realtime should show a
// `purchase` within a minute. If nothing arrives, check in the pixel's
// "Test" view that `event.data.checkout.attributes` lists `_ga_client_id`.

const MEASUREMENT_ID = "G-43F991WPBG";
const CLIENT_ID_KEY = "_ga_client_id";
const SESSION_ID_KEY = "_ga_session_id";

function attribute(checkout, key) {
  const found = (checkout.attributes || []).find((entry) => entry.key === key);
  return found && found.value ? String(found.value) : null;
}

function loadGtag(clientId, sessionId, pageLocation) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    client_id: clientId,
    session_id: sessionId || undefined,
    page_location: pageLocation,
    send_page_view: false,
    // The sandbox's own cookies are throwaway; the identity is the client id.
    cookie_domain: "none",
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(script);
}

analytics.subscribe("checkout_completed", (event) => {
  const checkout = event.data.checkout;
  const clientId = attribute(checkout, CLIENT_ID_KEY);

  // No client id: the visitor refused analytics, or never reached checkout
  // through the site. Send nothing.
  if (!clientId) return;

  loadGtag(
    clientId,
    attribute(checkout, SESSION_ID_KEY),
    event.context.document.location.href,
  );

  const money = (value) => Number(value && value.amount) || 0;

  window.gtag("event", "purchase", {
    transaction_id: (checkout.order && checkout.order.id) || checkout.token,
    currency: (checkout.totalPrice && checkout.totalPrice.currencyCode) || "EUR",
    value: money(checkout.totalPrice),
    tax: money(checkout.totalTax),
    shipping: money(checkout.shippingLine && checkout.shippingLine.price),
    items: (checkout.lineItems || []).map((line) => ({
      item_id:
        (line.variant && line.variant.product && line.variant.product.url
          ? line.variant.product.url.split("/").pop()
          : null) || (line.variant && line.variant.sku) || line.title,
      item_name: line.title,
      price: money(line.variant && line.variant.price),
      quantity: line.quantity,
    })),
  });
});
