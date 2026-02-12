import HeroSection from "../components/sections/HeroSection";
import FeatureGrid from "../components/sections/FeatureGrid";
import PopularSection from "../components/sections/PopularSection";
import CTASection from "../components/sections/CTASection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <PopularSection />

      {/* Trust / Guidance Message */}
      <section className="max-w-3xl mx-auto text-center py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-lg transition-shadow duration-500">
        <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🤔</div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
          Feeling confused is normal.{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choosing blindly isn't.
          </span>
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
          Choosing an IT path after +2 can feel overwhelming. VISION helps you
          understand your options clearly, step by step, so you can make
          informed decisions with confidence.
        </p>
      </section>

      <CTASection />
    </>
  );
};

export default Home;
