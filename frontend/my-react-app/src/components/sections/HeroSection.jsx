import { Link } from "react-router-dom";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";
import HeroFireflyIcons from "./HeroFireflyIcons";

const HeroSection = () => {
  return (
    <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ">
      <div className="order-2 lg:order-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mb-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Made for +2 Graduates in Nepal
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          Confused about <GradientText>IT careers after +2?</GradientText>
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-base sm:text-lg">
          Explore IT fields, understand degree options like CSIT, BCA, and BIT,
          and discover real IT career opportunities in Nepal — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button as={Link} to="/it-fields" variant="primary" size="medium">
            Explore IT Fields →
          </Button>
          <Button as={Link} to="/register" variant="secondary" size="medium">
            Register Now
          </Button>
        </div>
      </div>

      <div className="order-1 lg:order-2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
        <div className="relative h-64 sm:h-72 lg:h-80">
          <HeroFireflyIcons />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
