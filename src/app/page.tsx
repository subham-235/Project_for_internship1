import LandingNavbar from "@/components/home/LandingNavbar";
import Hero from "@/components/home/Hero";
import SpecialtySection from "@/components/home/SpecialtySection";
import FeaturedDoctors from "@/components/home/FeaturedDoctors";
import StatementSection from "@/components/home/StatementSection";
import HowItWorks from "@/components/home/HowItWorks";
import ForEveryone from "@/components/home/ForEveryone";
import Testimonials from "@/components/home/Testimonials";
import FinalCTA from "@/components/home/FinalCTA";
import LandingFooter from "@/components/home/LandingFooter";
import CareTicker from "@/components/home/CareTicker";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar />
      <main>
        <Hero />
        <CareTicker />
        <SpecialtySection />
        <FeaturedDoctors />
        <StatementSection />
        <HowItWorks />
        <ForEveryone />
        <Testimonials />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
