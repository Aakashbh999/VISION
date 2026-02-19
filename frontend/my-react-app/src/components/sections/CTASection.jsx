import Button from "../ui/Button";
import GradientText from "../ui/GradientText";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl lg:rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-8 lg:p-12 rounded-2xl lg:rounded-3xl border border-blue-200">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Start your IT journey with{" "}
            <GradientText>clarity, not confusion.</GradientText>
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
            VISION provides the right information at the right time to help you
            move forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              as="a"
              href="/it-fields"
              variant="primary"
              size="large"
              className="flex items-center justify-center gap-2"
            >
              Begin Your Journey
              <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                🚀
              </span>
            </Button>
            <Button
              as="a"
              href="/academic-guide"
              variant="secondary"
              size="large"
            >
              Explore Academic Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
