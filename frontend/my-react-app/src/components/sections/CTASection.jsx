import { Link } from "react-router-dom";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl lg:rounded-3xl py-8 sm:py-10 lg:py-12">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl"></div>

      {/* Content box */}
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-8 lg:p-12 rounded-2xl lg:rounded-3xl border border-blue-200 shadow-xl">
        <div className="max-w-2xl">
          {/* Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Take Control of Your IT Career Path{" "}
            <GradientText>with VISION</GradientText>
          </h2>

          {/* Subtext */}
          <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
            VISION helps Nepalese IT students discover structured career
            roadmaps, join meaningful discussions, and connect with like‑minded
            peers. Don’t just choose blindly — build your future with clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              as={Link}
              to="/career-paths"
              variant="primary"
              size="large"
              className="flex items-center justify-center gap-2 shadow-lg"
            >
              🚀 Explore Career Paths
            </Button>
            <Button
              as={Link}
              to="/community"
              variant="secondary"
              size="large"
              className="bg-white/80 backdrop-blur-sm"
            >
              👥 Join the Community
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
