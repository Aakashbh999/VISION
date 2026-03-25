import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";

const CTASection = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl lg:rounded-3xl py-8 sm:py-10 lg:py-12">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-600/10 to-pink-500/10 blur-2xl"></div>

        {/* Content box */}
        <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 lg:p-12 rounded-2xl lg:rounded-3xl border border-purple-200 shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-main)] mb-3 sm:mb-4">
              Take Control of Your IT Career Path{" "}
              <GradientText>with VISION</GradientText>
            </h2>

            <p className="text-[var(--text-muted)] mb-6 sm:mb-8 text-base sm:text-lg">
              VISION helps Nepalese IT students discover structured career
              roadmaps, join meaningful discussions, and connect with
              like‑minded peers. Don’t just choose blindly — build your future
              with clarity.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                as={Link}
                to="/career-paths"
                variant="gradient"
                size="lg"
                className="flex items-center justify-center gap-2 shadow-lg"
              >
                🎓 Discover Career Paths
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                variant="secondary"
                size="lg"
                className="bg-white/80 backdrop-blur-sm"
              >
                👥 Join the Community
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
        >
          <div
            className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[var(--border-main)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[var(--text-main)]">
                🌐 Join the VISION Community
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-[var(--text-muted)] mb-8 text-sm leading-normal text-justify">
              Be part of a growing network of IT students and mentors in Nepal.
              By creating a free account, you’ll unlock access to career
              roadmaps, discussions, and guidance tailored to your academic
              journey. It only takes a minute to get started!
            </p>

            <div className="flex gap-4">
              <Link
                to="/register"
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 
                           text-white text-center py-3 px-4 rounded-lg font-semibold 
                           hover:shadow-lg transition-shadow"
                onClick={() => setShowModal(false)}
              >
                Register
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-[var(--border-main)] text-[var(--text-muted)] py-3 px-4 
                           rounded-lg font-medium hover:bg-[var(--bg-active)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CTASection;