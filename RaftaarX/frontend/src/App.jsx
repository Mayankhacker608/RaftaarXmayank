import "./App.css";
import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Nav from "./components/Nav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import About from "./pages/About.jsx";
import Admin from "./pages/Admin.jsx";
import Auth from "./pages/Auth.jsx";
import Blog from "./pages/Blog.jsx";
import Contactus from "./pages/Contactus.jsx";
import Home from "./pages/Home.jsx";
import Partner from "./pages/Partner.jsx";
import Payment from "./pages/Payment.jsx";
import RideReview from "./pages/RideReview.jsx";
import RideStatus from "./pages/RideStatus.jsx";
import Safety from "./pages/Safety.jsx";
import Support from "./pages/Support.jsx";
import User from "./pages/User.jsx";

function Layout() {
  const location = useLocation();
  const hideNavbarRoutes = [
    "/auth",
    "/user",
    "/partner",
    "/admin",
    "/payment",
    "/ride-review",
    "/ride-status",
  ];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/contact" element={<Contactus />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={["user"]}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner"
          element={
            <ProtectedRoute roles={["partner"]}>
              <Partner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute roles={["user"]}>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ride-review"
          element={
            <ProtectedRoute roles={["user"]}>
              <RideReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ride-status"
          element={
            <ProtectedRoute roles={["user"]}>
              <RideStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="theme-page flex min-h-screen items-center justify-center px-6 text-center text-3xl">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
