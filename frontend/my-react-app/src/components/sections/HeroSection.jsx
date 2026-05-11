import { Link } from "react-router-dom";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";
import HeroFireflyIcons from "./HeroFireflyIcons";

const HeroSection = () => {
  return (
    <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="order-2 lg:order-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-main)] mb-6 leading-tight">
          Master your <GradientText>IT Journey in Nepal</GradientText>
        </h1>
        <p className="text-[var(--text-muted)] mb-8 leading-relaxed text-base sm:text-lg text-justify">
          Whether you're a <strong>+2 graduate</strong> exploring degrees like
          CSIT and BCA, or an <strong>undergraduate student</strong> looking to
          bridge the gap between syllabus and industry — we’ve got you covered.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button as={Link} to="/it-fields" variant="gradient" size="lg">
            Explore IT Fields →
          </Button>
          <Button as={Link} to="/login" variant="secondary" size="lg">
            Student Login
          </Button>
        </div>
      </div>

      <div className="order-1 lg:order-2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
        <div className="relative h-64 sm:h-72 lg:h-80">
          <HeroFireflyIcons />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
