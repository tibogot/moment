import { Footer } from "@/components/Footer";
import { IntroSection } from "@/components/IntroSection";
import { PageIntro } from "@/components/PageIntro";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata({
  title: "Coffee Desk",
  description:
    "The Moment coffee desk in Brussels — filter and espresso, pastries out of our own kitchen, and cold-pressed juices to take away.",
  path: routes.coffee,
  keywords: ["coffee Brussels", "coffee desk Brussels", "pastries Brussels"],
});

export default function CoffeePage() {
  return (
    <>
      <PageIntro
        title="Coffee"
        lead="A coffee desk for anyone passing by, serving the same pastries and juices we send out to our clients."
      />

      {/* Temporary: the home page's intro headline with the first-line indent
          off, to compare against the indented one on /. Remove both this and
          the prop once the call is made. */}
      <IntroSection indentFirstLine={false} />

      <Footer />
    </>
  );
}
