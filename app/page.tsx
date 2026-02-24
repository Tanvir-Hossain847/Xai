import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { InsightFlowSection } from "@/components/sections/InsightFlowSection";
import { DashboardSection } from "@/components/sections/DashboardSection";
import { ConstellationSection } from "@/components/sections/ConstellationSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* 1 — Hero: Data → Intelligence */}
        <HeroSection />

        {/* 2 — Insight Flow: How Intelligence Forms */}
        <InsightFlowSection />

        {/* 3 — Dashboard: Product Reality */}
        <DashboardSection />

        {/* 4 — Constellation: WOW Moment */}
        <ConstellationSection />
      </main>

      <Footer />
    </div>
  );
}
