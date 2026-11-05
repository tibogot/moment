/**
 * The Shopify end of on-demand revalidation.
 *
 * Same job as the Sanity route next door: the catalogue and the delivery
 * settings are cached until something says otherwise, and this is the
 * something. Without it the shop runs a day behind on prices and stock.
 *
 * Configure it in Shopify admin → Settings → Notifications → Webhooks, one
 * subscription per topic, all pointing at:
 *
 *   https://<your-domain>/api/revalidate/shopify
 *
 * Topics worth subscribing to:
 *
 *   products/create, products/update, products/delete
 *   collections/create, collections/update, collections/delete
 *   inventory_levels/update          (sold out / back in stock)
 *   metaobjects/create, metaobjects/update, metaobjects/delete
 *                                    (delivery zones, closures, atelier hours)
 *   orders/create, orders/updated, orders/cancelled
 *                                    (delivery window capacity — a new order
 *                                    is tagged with its day and window, and
 *                                    the counts are re-read; see
 *                                    lib/shopify/capacity.ts)
 *
 * Shopify shows the signing secret once, when the first webhook is created —
 * it is one secret for the whole shop, not one per topic. Put it in
 * SHOPIFY_WEBHOOK_SECRET.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  DELIVERY_CAPACITY_TAG,
  tagOrderBooking,
} from "@/lib/shopify/capacity";
import { DELIVERY_CACHE_TAG } from "@/lib/shopify/metaobjects";
import { SHOPIFY_CACHE_TAG } from "@/lib/shopify/products";

/**
 * Which cache a topic belongs to.
 *
 * Matched on the prefix because Shopify's topics are `resource/verb` and the
 * verb never matters here — a product deleted and a product updated invalidate
 * the same reads.
 */
const TAGS_BY_TOPIC_PREFIX: Record<string, string> = {
  products: SHOPIFY_CACHE_TAG,
  collections: SHOPIFY_CACHE_TAG,
  inventory_levels: SHOPIFY_CACHE_TAG,
  inventory_items: SHOPIFY_CACHE_TAG,
  metaobjects: DELIVERY_CACHE_TAG,
  orders: DELIVERY_CAPACITY_TAG,
};

/** The parts of a REST order webhook payload the capacity tagging reads. */
type OrderWebhookPayload = {
  admin_graphql_api_id?: string;
  tags?: string;
  note_attributes?: { name: string; value: string | null }[];
};

/**
 * Tags the order with its day and window, then lets the caller clear the
 * counts. A failure is logged and swallowed: the webhook must still answer 200,
 * or Shopify retries for two days and then disables the subscription — and the
 * order is not lost, it is only uncounted until someone tags it by hand.
 */
async function tagBooking(rawBody: string) {
  try {
    const order = JSON.parse(rawBody) as OrderWebhookPayload;
    if (!order.admin_graphql_api_id) return;

    await tagOrderBooking({
      id: order.admin_graphql_api_id,
      tags: (order.tags ?? "").split(",").filter(Boolean),
      attributes: Object.fromEntries(
        (order.note_attributes ?? [])
          .filter((attribute) => attribute.value)
          .map((attribute) => [attribute.name, attribute.value as string]),
      ),
    });
  } catch (error) {
    console.error("[revalidate] could not tag order booking", error);
  }
}

/**
 * Shopify signs the raw body with HMAC-SHA256 and sends it base64 in
 * `X-Shopify-Hmac-Sha256`.
 *
 * Compared in constant time. The comparison is cheap and the endpoint is
 * public, so the usual reason to skip it — "nobody is going to sit there
 * timing string compares against a cache-busting endpoint" — is an assumption
 * this does not need to make.
 */
function isAuthentic(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const received = Buffer.from(signature, "base64");

  // `timingSafeEqual` throws on a length mismatch, and `Buffer.from` will
  // happily return a short buffer for malformed base64 rather than failing.
  if (received.length !== expected.length) return false;

  return timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "[revalidate] SHOPIFY_WEBHOOK_SECRET is not set; webhook rejected",
    );
    return NextResponse.json(
      { revalidated: [], message: "Webhook secret is not configured" },
      { status: 500 },
    );
  }

  // Read as text, not JSON: the signature covers the bytes Shopify sent, and
  // a parse-and-restringify round trip would not reproduce them.
  const rawBody = await request.text();

  if (!isAuthentic(rawBody, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return NextResponse.json(
      { revalidated: [], message: "Invalid signature" },
      { status: 401 },
    );
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  const tag = TAGS_BY_TOPIC_PREFIX[topic.split("/")[0]];

  // 200, not 4xx, for a topic we do not care about. Shopify retries non-2xx
  // responses for two days and disables the subscription if they keep failing,
  // so an unrecognised topic must not look like an outage.
  if (!tag) {
    return NextResponse.json({ revalidated: [], topic, now: Date.now() });
  }

  // Tagged before the counts are cleared, so the re-read that follows already
  // sees this order. Cancellations need no tag, only the re-read.
  if (topic === "orders/create" || topic === "orders/updated") {
    await tagBooking(rawBody);
  }

  revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: [tag], topic, now: Date.now() });
}
