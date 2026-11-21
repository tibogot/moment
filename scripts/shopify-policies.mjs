#!/usr/bin/env node
/**
 * Installs the shop's legal policies in French, with Dutch and English
 * translations, from docs/shopify-policies.html.
 *
 *   npm run shopify:policies            # show what would change
 *   npm run shopify:policies -- --apply # write it
 *
 * The policies are the links Shopify prints at the foot of its checkout
 * (refunds, privacy, terms, shipping, legal notice, contact). The long ones
 * summarise and link to the site's own pages, so the full text lives in one
 * place; edit docs/shopify-policies.html and run this again to change them.
 *
 * Uses the Admin app's credentials (SHOPIFY_ADMIN_CLIENT_ID / _SECRET, from
 * the environment or .env.local). The app needs the `write_legal_policies`
 * and `write_translations` scopes.
 */

import { existsSync, readFileSync } from "node:fs";

const FILE = "docs/shopify-policies.html";
const TRANSLATIONS = ["nl", "en"];

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

/** Every `<div class="text" data-policy=… data-lang=…>` block, as tidy HTML. */
function readPolicies() {
  const html = readFileSync(FILE, "utf8");
  const blocks = {};
  const pattern =
    /<div class="text" data-policy="([A-Z_]+)" data-lang="([a-z]{2})">([\s\S]*?)<\/div><\/div>/g;
  for (const [, type, lang, body] of html.matchAll(pattern)) {
    blocks[type] ??= {};
    blocks[type][lang] = body.trim().replace(/\n+/g, "").replace(/<h3>/g, "<h2>").replace(/<\/h3>/g, "</h2>");
  }
  return blocks;
}

const apply = process.argv.includes("--apply");
const policies = readPolicies();
const types = Object.keys(policies);
if (types.length !== 6 || types.some((type) => !policies[type].fr)) {
  console.error(`Expected 6 policies with French text in ${FILE}, found ${types.length}.`);
  process.exit(1);
}

if (!apply) {
  for (const type of types) {
    console.log(`${type}: ${Object.keys(policies[type]).join(", ")} (${policies[type].fr.length} chars in French)`);
  }
  console.log("\nDry run. Add --apply to write them to the shop.");
  process.exit(0);
}

const env = loadEnv();
const shop = env.SHOPIFY_STORE_DOMAIN;
const version = env.SHOPIFY_API_VERSION || "2026-10";
if (!shop || !env.SHOPIFY_ADMIN_CLIENT_ID || !env.SHOPIFY_ADMIN_CLIENT_SECRET) {
  console.error("Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET.");
  process.exit(1);
}

const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
    client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
  }),
});
if (!tokenResponse.ok) {
  throw new Error(`Token request failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
}
const { access_token: accessToken } = await tokenResponse.json();

async function admin(query, variables = {}) {
  const response = await fetch(`https://${shop}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(`Admin API: ${response.status} ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

for (const type of types) {
  const { shopPolicyUpdate } = await admin(
    `mutation ($policy: ShopPolicyInput!) {
      shopPolicyUpdate(shopPolicy: $policy) {
        shopPolicy { id }
        userErrors { field message }
      }
    }`,
    { policy: { type, body: policies[type].fr } },
  );
  if (shopPolicyUpdate.userErrors.length) {
    throw new Error(`${type}: ${shopPolicyUpdate.userErrors.map((e) => e.message).join("; ")}`);
  }
  const id = shopPolicyUpdate.shopPolicy.id;

  // A translation is tied to the digest of the French text it translates.
  const { translatableResource } = await admin(
    `query ($id: ID!) {
      translatableResource(resourceId: $id) { translatableContent { key digest } }
    }`,
    { id },
  );
  const body = translatableResource.translatableContent.find((c) => c.key === "body");

  for (const locale of TRANSLATIONS) {
    if (!policies[type][locale] || !body) continue;
    const { translationsRegister } = await admin(
      `mutation ($id: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $id, translations: $translations) {
          userErrors { field message }
        }
      }`,
      {
        id,
        translations: [
          { locale, key: "body", value: policies[type][locale], translatableContentDigest: body.digest },
        ],
      },
    );
    if (translationsRegister.userErrors.length) {
      throw new Error(`${type} ${locale}: ${translationsRegister.userErrors.map((e) => e.message).join("; ")}`);
    }
  }
  console.log(`${type}: French saved, ${TRANSLATIONS.join(" and ")} translated.`);
}
