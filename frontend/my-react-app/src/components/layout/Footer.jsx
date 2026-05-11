import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Info, ChevronUp, ChevronDown } from "lucide-react";

const Footer = ({ withSidebarOffset = false }) => {
  const [expandedSection, setExpandedSection] = useState(null); // 'about', 'contact', or null

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer
      className={`mt-12 sm:mt-16 lg:mt-20 border-t border-(--border-main) bg-(--bg-main) py-5 sm:py-8 pb-24 lg:pb-8 transition-colors duration-300 ${
        withSidebarOffset ? "lg:ml-64" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <span className="text-lg font-bold bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              VISION
            </span>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-1">
              Your IT Career Compass
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <button
              onClick={() => toggleSection("about")}
              className={`flex items-center gap-1.5 text-xs sm:text-sm transition-colors duration-300 ${
                expandedSection === "about"
                  ? "text-purple-600 font-semibold"
                  : "text-(--text-muted) hover:text-purple-600"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              About
              {expandedSection === "about" ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => toggleSection("contact")}
              className={`flex items-center gap-1.5 text-xs sm:text-sm transition-colors duration-300 ${
                expandedSection === "contact"
                  ? "text-purple-600 font-semibold"
                  : "text-(--text-muted) hover:text-purple-600"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Contact
              {expandedSection === "contact" ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expandedSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-8 p-6 rounded-2xl bg-(--bg-card) border border-(--border-main) shadow-sm">
                {expandedSection === "about" ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-purple-700 flex items-center gap-2">
                      <Info className="w-4 h-4" /> About VISION
                    </h4>
                    <p className="text-sm text-(--text-muted) leading-relaxed text-justify">
                      VISION is an IT career guidance platform dedicated to
                      undergraduate students in Nepal. We provide structured
                      roadmaps, academic resources, and a community-driven
                      reputation system to help students navigate the complex
                      landscape of the IT industry. Our goal is to empower the
                      next generation of Nepalese tech professionals with
                      clarity and community support.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-bold text-purple-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Contact Us
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-(--bg-active) border border-(--border-main)">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                          Support Email
                        </p>
                        <p className="text-sm font-medium mt-1">
                          support@vision.com.np
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-(--bg-active) border border-(--border-main)">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                          Community Lead
                        </p>
                        <p className="text-sm font-medium mt-1">
                          bhandariaakash512@gmail.com
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-(--bg-active) border border-(--border-main)">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                          Location
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Butwal, Rupendehi
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs text-(--text-muted)">
            © 2026 VISION. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
