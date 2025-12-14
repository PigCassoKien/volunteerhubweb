import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RoleRoute from "./components/RoleRoute";
import NotFound from "./pages/Error/NotFound";

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
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminEvents = lazy(() => import("./pages/Admin/AdminEvents"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUsers"));
const AdminExport = lazy(() => import("./pages/Admin/AdminExport"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));

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

              {/* Manager area: only EVENT_MANAGER or ADMIN */}
              <Route
                path="/manager"
                element={
                  <RoleRoute roles={["EVENT_MANAGER", "ADMIN"]}>
                    <ManagerHome />
                  </RoleRoute>
                }
              />
              <Route
                path="/manager/events/:id"
                element={
                  <RoleRoute roles={["EVENT_MANAGER", "ADMIN"]}>
                    <ManagerEventDetail />
                  </RoleRoute>
                }
              />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin area: only ADMIN */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute roles={["ADMIN"]}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <RoleRoute roles={["ADMIN"]}>
                    <AdminEvents />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleRoute roles={["ADMIN"]}>
                    <AdminUsers />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/export"
                element={
                  <RoleRoute roles={["ADMIN"]}>
                    <AdminExport />
                  </RoleRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <Suspense fallback={<div>Đang tải...</div>}>
                    <NotificationsPage />
                  </Suspense>
                }
              />

              {/* catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
