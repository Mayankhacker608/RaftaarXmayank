import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Briefcase, Shield } from "lucide-react";
import { motion } from "framer-motion";

function Role() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      
      {/* Main Box */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-[350px] text-center relative"
      >

        {/* Back Arrow */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 text-white hover:text-yellow-400 transition"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="text-white text-2xl font-bold mb-6">
          Select Role
        </h2>

        {/* Cards */}
        <div className="space-y-4">

          {/* User */}
          <div
            onClick={() => navigate("/user")}
            className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-black hover:scale-105 transition"
          >
            <User className="text-yellow-400" />
            <span className="text-white font-medium">User</span>
          </div>

          {/* Partner */}
          <div
            onClick={() => navigate("/partner")}
            className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-black hover:scale-105 transition"
          >
            <Briefcase className="text-yellow-400" />
            <span className="text-white font-medium">Partner</span>
          </div>

          {/* Admin */}
          <div
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-black hover:scale-105 transition"
          >
            <Shield className="text-yellow-400" />
            <span className="text-white font-medium">Admin</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Role;