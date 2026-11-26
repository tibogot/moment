import { Footer } from "@/components/Footer";
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
        title={dict.pageIntro.coffee.title}
        lead={dict.pageIntro.coffee.lead}
      />

      <Footer />
    </>
  );
}
