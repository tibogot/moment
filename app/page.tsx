import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <GridSection className="min-h-svh" />
      <Footer />
    </>
  );
}
