import type { CustomerProfile } from "./customer";

export function getCustomerDisplayName(customer: CustomerProfile) {
  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    customer.displayName ||
    customer.emailAddress?.emailAddress ||
    "Account"
  );
}
