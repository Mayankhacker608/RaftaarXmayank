import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

function Nav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/support" },
    { name: "Safety", path: "/safety" },
    { name: "Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed left-1/2 top-6 z-50 w-[90%] -translate-x-1/2 rounded-2xl border border-gray-700 bg-black/80 shadow-lg backdrop-blur-md md:w-[70%]"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent">
          RaftaarX
        </h1>

        <ul className="hidden space-x-10 font-medium text-gray-300 md:flex">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index} className="group relative cursor-pointer">
                <Link
                  to={item.path}
                  className={`transition duration-300 ${
                    isActive ? "text-white" : "group-hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-20 text-white focus:outline-none"
            >
              <span
                className={`mb-1 block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`mb-1 block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="relative hidden items-center justify-center overflow-hidden rounded-lg border border-gray-600 px-6 py-2 font-semibold text-white group md:inline-flex"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 transition duration-300 group-hover:opacity-100" />
              <span className="relative z-10 group-hover:text-black">Logout</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="relative hidden items-center justify-center overflow-hidden rounded-lg border border-gray-600 px-6 py-2 font-semibold text-white group md:inline-flex"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 transition duration-300 group-hover:opacity-100" />
              <span className="relative z-10 group-hover:text-black">Login</span>
            </Link>
          )}
        </div>

        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
          className={`absolute left-0 top-full flex w-full flex-col items-center space-y-4 rounded-b-2xl bg-black/90 py-6 backdrop-blur-md transition-all duration-300 md:hidden ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index} className="group cursor-pointer">
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition duration-300 ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
          <Link
            to="/auth"
            onClick={() => setIsOpen(false)}
            className="rounded-full border border-yellow-400 px-5 py-2 text-sm font-semibold text-yellow-300"
          >
            {user ? "Switch Dashboard" : "Login / Signup"}
          </Link>
        </motion.ul>
      </div>
    </motion.nav>
  );
}

export default Nav;
