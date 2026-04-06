import HeroSection from "../components/sections/HeroSection";
import FeatureGrid from "../components/sections/FeatureGrid";
import PopularSection from "../components/sections/PopularSection";
import CTASection from "../components/sections/CTASection";
import { HelpCircle, Lightbulb } from "lucide-react";

const Home = () => {
  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">
      <HeroSection />
      <FeatureGrid />
      <PopularSection />
      {/* Trust / Guidance Message */}
      <section className="max-w-4xl mx-auto text-center py-8 sm:py-10 lg:py-12 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-active)] border border-[var(--border-main)] hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(124,58,237,0.25)] transition-all duration-500">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <Lightbulb className="w-12 h-12 text-yellow-400 glow" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mb-3 sm:mb-4">
          Feeling confused is normal.{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choosing blindly isn't.
          </span>
        </h2>
        <p className="text-[var(--text-muted)] leading-relaxed text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
          Choosing an IT path after +2 can feel overwhelming. VISION helps you
          understand your options clearly, step by step, so you can make
          informed decisions with confidence.
        </p>
      </section>

      <CTASection />
    </div>
  );
};

export default Home;
