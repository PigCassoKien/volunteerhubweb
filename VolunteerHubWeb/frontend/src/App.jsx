import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const EventList = lazy(() => import("./pages/Event/EventList"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Profile = lazy(() => import("./pages/User/Profile"));
const EventDetail = lazy(() => import("./pages/Event/EventDetail"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ManagerHome = lazy(() => import("./pages/Manager/ManagerHome"));
const ManagerEventDetail = lazy(() => import("./pages/Manager/ManagerEventDetail"));
const SavedEvents = lazy(() => import("./pages/Event/SavedEvents"));

function App() {
  return (
    <Router>
      <ScrollToTop />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/saved-events" element={<SavedEvents />} />
              <Route path="/manager/events/:id" element={<ManagerEventDetail />} />
              <Route path="/manager" element={<ManagerHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
