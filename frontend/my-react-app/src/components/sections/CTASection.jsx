import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";
import { GraduationCap, Users, Globe } from "lucide-react";

const CTASection = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  return (
    <>
      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-2xl lg:rounded-3xl py-8 sm:py-10 lg:py-12">
        {/* Background glow */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl"></div>

        {/* Content box */}
        <div className="relative bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 p-6 sm:p-8 lg:p-12 rounded-sm sm:rounded-2xl lg:rounded-3xl border border-blue-200 dark:border-blue-900/50 shadow-xl">
          <div className="max-w-2xl">
            {/* Headline */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-(--text-main) mb-3 sm:mb-4 leading-tight">
              Take Control of Your IT Career Path{" "}
              <GradientText>with VISION</GradientText>
            </h2>

            {/* Subtext */}
            <p className="text-(--text-muted) mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed  ">
              VISION helps Nepalese IT students discover structured career
              roadmaps, join meaningful discussions, and connect with
              like‑minded peers. Don’t choose blindly — build your future
              with clarity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                as={Link}
                to="/career-paths"
                variant="gradient"
                size="lg"
                className="flex items-center justify-center gap-2 shadow-lg"
              >
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" /> Discover Career Paths
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                variant="secondary"
                size="lg"
                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6" /> Join the Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
          role="presentation"
        >
          <div
            className="bg-(--bg-card) rounded-2xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-(--border)"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-modal-title"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3
                id="cta-modal-title"
                className="text-xl sm:text-2xl font-bold text-(--text-main) flex items-center gap-2"
              >
                <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" /> Join the VISION Community
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-(--text-muted) hover:text-(--text-main) text-xl"
                type="button"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Message */}
            <p className="text-(--text-muted) mb-8 text-sm leading-relaxed text-justify">
              Be part of a growing network of IT students and mentors in Nepal.
              By creating a free account, you’ll unlock access to career
              roadmaps, discussions, and guidance tailored to your academic
              journey. It only takes a minute to get started!
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                as={Link}
                to="/register"
                variant="gradient"
                size="md"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Register
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CTASection;
