import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookies",
  description:
    "Cookie policy for the Moment website — which cookies we set, what they do, and how to change your choice.",
  path: routes.cookies,
});

export default function CookiesPage() {
  return (
    <LegalDoc
      title="Cookies"
      lead="How cookies and similar technologies are used on this site. Draft copy — final list of cookies will match the live stack."
    >
      <LegalSection title="What are cookies">
        <p>
          Cookies are small files stored on your device. They help the site
          work, remember preferences, and — where you consent — measure usage.
        </p>
      </LegalSection>

      <LegalSection title="Types we use">
        <p>
          Strictly necessary cookies (session, cart, security) run without
          consent. Analytics and marketing cookies are only used after you
          accept them through the cookie banner.
        </p>
      </LegalSection>

      <LegalSection title="Managing cookies">
        <p>
          You can change or withdraw consent at any time via the cookie
          preferences control on the site, or through your browser settings.
          Blocking necessary cookies may affect checkout and account features.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
