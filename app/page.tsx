import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { ServicesSection } from "@/components/ServicesSection";

export default function Home() {
  return (
    <>
      <Hero />
      <IntroSection />
      <ServicesSection />
      <Footer />
    </>
  );
}
