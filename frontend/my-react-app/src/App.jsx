import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import MobileMenu from "./components/layout/MobileMenu";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import ITFields from "./pages/ITFields";
import AcademicGuide from "./pages/AcademicGuide";
import ITJobs from "./pages/ITJobs";
import ITClubs from "./pages/ITClubs";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
        <Navbar onMobileMenuToggle={toggleMobileMenu} />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        <div className="flex pt-16">
          <Sidebar />
          <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-12 sm:space-y-16 lg:space-y-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/it-fields" element={<ITFields />} />
              <Route path="/academic-guide" element={<AcademicGuide />} />
              <Route path="/it-jobs" element={<ITJobs />} />
              <Route path="/it-clubs" element={<ITClubs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
