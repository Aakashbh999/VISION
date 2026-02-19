import Button from "../ui/Button";
import GradientText from "../ui/GradientText";

const HeroSection = () => {
  return (
    <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="order-2 lg:order-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mb-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Made for +2 Graduates in Nepal
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          Confused about <GradientText>IT careers after +2?</GradientText>
        </h1>
        <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed text-base sm:text-lg">
          Explore IT fields, understand degree options like CSIT, BCA, and BIT,
          and discover real IT career opportunities in Nepal — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button as="a" href="/it-fields" variant="primary" size="medium">
            Explore IT Fields →
          </Button>
          <Button
            as="a"
            href="/academic-guide"
            variant="secondary"
            size="medium"
          >
            View Academic Guide
          </Button>
        </div>
      </div>

      <div className="order-1 lg:order-2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
        <div className="relative h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 flex flex-col items-center justify-center text-blue-400 overflow-hidden">
          <div className="animate-float">
            <div className="text-5xl sm:text-6xl mb-4">🎯</div>
          </div>
          <p className="text-base sm:text-lg font-medium text-gray-700 mt-4">
            Interactive Career Map
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Visualize your IT journey
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
