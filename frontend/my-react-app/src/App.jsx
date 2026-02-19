import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import ITFields from "./pages/ITFields";
import AcademicGuide from "./pages/AcademicGuide";
import ITJobs from "./pages/ITJobs";
import ITClubs from "./pages/ITClubs";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/fields" element={<ITFields />} />
              <Route path="/guide" element={<AcademicGuide />} />
              <Route path="/jobs" element={<ITJobs />} />
              <Route path="/clubs" element={<ITClubs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
