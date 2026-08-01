import type { ConsentCategoryMeta } from "@/lib/consent/types";

export const OPTIONAL_CONSENT_CATEGORIES: ConsentCategoryMeta[] = [
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Helps us understand how the site is used so we can improve it.",
  },
  {
    id: "marketing",
    title: "Marketing",
    description:
      "Allows personalised offers and measuring campaigns on other platforms.",
  },
];
