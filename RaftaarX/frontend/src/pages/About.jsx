import React from "react";
import { motion } from "framer-motion";
import aboutImg from '../assets/about.png';

function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 md:px-20 pt-32 md:pt-40" 
      // pt-32 for margin below navbar
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">

        {/* Left Side - PNG Image */}
       

<motion.img
  src={aboutImg}
  alt="Our Team"
  className="w-full md:w-1/2 rounded-xl shadow-lg"
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.8 }}
/>

        {/* Right Side - Text */}
        <motion.div
          className="md:w-1/2 space-y-6"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">
            About Us
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            RaftaarX is dedicated to delivering high-quality learning experiences
            with speed and efficiency. Our team of passionate developers, designers,
            and educators work together to create intuitive, interactive, and
            engaging solutions for learners worldwide.
          </p>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            Our mission is simple: make learning faster, smoother, and enjoyable.
            We believe in innovation, creativity, and a user-first approach to
            every project we take on.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-300">
            Learn More
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default About;