const Footer = ({ withSidebarOffset = false }) => {
  return (
    <footer
      className={`mt-12 sm:mt-16 lg:mt-20 border-t border-border-main bg-bg-main py-6 sm:py-8 transition-colors duration-300 ${withSidebarOffset ? "lg:ml-64" : ""}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VISION
            </span>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Your IT Career Compass
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <button className="text-xs sm:text-sm text-text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
              Privacy
            </button>
            <button className="text-xs sm:text-sm text-text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
              Terms
            </button>
            <button className="text-xs sm:text-sm text-text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
              Contact
            </button>
          </div>
        </div>
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs text-text-muted">
            © 2026 VISION. Made for +2 graduates in Nepal.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
