const Footer = () => {
  return (
    <footer className="mt-12 sm:mt-16 lg:mt-20 border-t border-gray-200 bg-white py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VISION
            </span>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Your IT Career Compass</p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300">Privacy</a>
            <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300">Terms</a>
            <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300">Contact</a>
          </div>
        </div>
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs text-gray-500">© 2023 VISION. Made for +2 graduates in Nepal.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;