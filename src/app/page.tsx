import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { ValueSection } from "@/components/site/ValueSection";
import { JobsSection } from "@/components/site/JobsSection";
import { AboutSection } from "@/components/site/AboutSection";
import { ContactSection } from "@/components/site/ContactSection";
import { Footer } from "@/components/site/Footer";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { BackToTop } from "@/components/ui/BackToTop";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PageLoader } from "@/components/ui/PageLoader";
import { JsonLd } from "@/components/site/JsonLd";

export default function HomePage() {
  return (
    <>
      <PageLoader />
      <CustomCursor />
      <AmbientBackground />
      <JsonLd />
      <Navbar />
      <main>
        <Hero />
        <ValueSection />
        <JobsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
