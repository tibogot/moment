import { Footer } from "@/components/Footer";
import { IntroSection } from "@/components/IntroSection";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("coffee", {
  path: routes.coffee,
});

export default async function CoffeePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(toLocale(lang));

  return (
    <>
      <PageIntro
        title="Coffee"
        lead="A coffee desk for anyone passing by, serving the same pastries and juices we send out to our clients."
      />

      {/* Temporary: the home page's intro headline with the first-line indent
          off, to compare against the indented one on /. Remove both this and
          the prop once the call is made. */}
      <IntroSection
        copy={dict.home.intro}
        aboutLabel={dict.common.aboutUs}
        indentFirstLine={false}
      />

      <Footer />
    </>
  );
}
