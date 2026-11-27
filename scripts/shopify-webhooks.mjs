#!/usr/bin/env node
/**
 * Subscribes the Admin app to the metaobject webhooks the site needs.
 *
 *   npm run shopify:webhooks -- https://www.moment-lab.be
 *
 * Why a script: the admin's Settings → Notifications → Webhooks offers no
 * metaobject topics, so a change to a delivery rule (a closure, a zone, a
 * window) would otherwise take up to the 24-hour cache backstop to reach the
 * site. An app can subscribe to them, but only one metaobject type per
 * subscription — five types times create/update/delete is fifteen, which is
 * what this does.
 *
 * Reads SHOPIFY_STORE_DOMAIN, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_CLIENT_ID and
 * SHOPIFY_ADMIN_CLIENT_SECRET from the environment or from .env.local. Shopify
 * signs these webhooks with the app's client secret, which
 * app/api/revalidate/shopify/route.ts accepts alongside the shop's own.
 *
 * Safe to run again: existing subscriptions to the same address are kept, and
 * ones pointing at another address (the test deployment, say) are listed so
 * they can be removed with --prune.
 */

import { existsSync, readFileSync } from "node:fs";

const TYPES = [
  "delivery_settings",
  "delivery_closure",
  "delivery_zone",
  "delivery_slot",
  "pickup_slot",
];
const TOPICS = ["METAOBJECTS_CREATE", "METAOBJECTS_UPDATE", "METAOBJECTS_DELETE"];
const ENDPOINT_PATH = "/api/revalidate/shopify";

function loadEnv() {
  const env = { ...process.env };
  if (existsSync(".env.local")) {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].trim();
    }
  }
  return env;
}

const args = process.argv.slice(2);
const prune = args.includes("--prune");
const siteUrl = args.find((arg) => !arg.startsWith("--"));

if (!siteUrl || !/^https:\/\//.test(siteUrl)) {
  console.error("Usage: npm run shopify:webhooks -- https://<site address> [--prune]");
  process.exit(1);
}

const env = loadEnv();
const shop = env.SHOPIFY_STORE_DOMAIN;
const version = env.SHOPIFY_API_VERSION || "2026-10";
const clientId = env.SHOPIFY_ADMIN_CLIENT_ID;
const clientSecret = env.SHOPIFY_ADMIN_CLIENT_SECRET;

if (!shop || !clientId || !clientSecret) {
  console.error(
    "Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET.",
  );
  process.exit(1);
}

/*
 * A site behind Vercel's login (the private test address) rejects Shopify's
 * calls like any visitor. WEBHOOK_BYPASS_SECRET — the project's "Protection
 * Bypass for Automation" key — goes in the address, where Vercel reads it;
 * Shopify cannot send a custom header. Leave it unset for the real domain.
 */
const bypass = process.env.WEBHOOK_BYPASS_SECRET?.trim();
const callbackUrl =
  siteUrl.replace(/\/$/, "") +
  ENDPOINT_PATH +
  (bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "");
/** The address as printed: never the key. */
const shown = callbackUrl.replace(/(x-vercel-protection-bypass=)[^&]+/, "$1***");

async function token() {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).access_token;
}

const accessToken = await token();

async function admin(query, variables = {}) {
  const response = await fetch(`https://${shop}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(`Admin API: ${response.status} ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const existing = (
  await admin(`{
    webhookSubscriptions(first: 100, topics: [${TOPICS.join(", ")}]) {
      nodes { id topic filter uri }
    }
  }`)
).webhookSubscriptions.nodes;

const key = (topic, filter) => `${topic} ${filter}`;
const current = new Set(
  existing.filter((sub) => sub.uri === callbackUrl).map((sub) => key(sub.topic, sub.filter)),
);

let created = 0;
for (const type of TYPES) {
  for (const topic of TOPICS) {
    const filter = `type:${type}`;
    if (current.has(key(topic, filter))) continue;

    const data = await admin(
      `mutation ($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) {
          webhookSubscription { id }
          userErrors { field message }
        }
      }`,
      { topic, sub: { uri: callbackUrl, filter, format: "JSON" } },
    );
    const errors = data.webhookSubscriptionCreate.userErrors;
    if (errors.length) {
      throw new Error(`${topic} ${filter}: ${errors.map((e) => e.message).join("; ")}`);
    }
    created += 1;
  }
}

const elsewhere = existing.filter((sub) => sub.uri !== callbackUrl);
for (const sub of elsewhere) {
  if (prune) {
    await admin(
      `mutation ($id: ID!) { webhookSubscriptionDelete(id: $id) { userErrors { message } } }`,
      { id: sub.id },
    );
  }
}

console.log(
  `${created} subscription(s) created, ${TYPES.length * TOPICS.length - created} already in place, for ${shown}.`,
);
if (elsewhere.length) {
  console.log(
    prune
      ? `${elsewhere.length} subscription(s) to other addresses removed.`
      : `${elsewhere.length} subscription(s) still point at another address — run again with --prune to remove them.`,
  );
}
