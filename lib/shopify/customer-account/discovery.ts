import { getStoreDomain } from "./config";

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type CustomerAccountApiConfiguration = {
  graphql_api: string;
};

export async function getOpenIdConfiguration() {
  const storeDomain = getStoreDomain();
  const response = await fetch(
    `https://${storeDomain}/.well-known/openid-configuration`,
    { next: { revalidate: 60 * 60 } },
  );

  if (!response.ok) {
    throw new Error("Unable to load Shopify OpenID configuration.");
  }

  return (await response.json()) as OpenIdConfiguration;
}

export async function getCustomerAccountApiConfiguration() {
  const storeDomain = getStoreDomain();
  const response = await fetch(
    `https://${storeDomain}/.well-known/customer-account-api`,
    { next: { revalidate: 60 * 60 } },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load Shopify Customer Account API configuration.",
    );
  }

  return (await response.json()) as CustomerAccountApiConfiguration;
}
