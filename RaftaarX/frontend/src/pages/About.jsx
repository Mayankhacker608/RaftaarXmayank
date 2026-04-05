import React from "react";
import { motion } from "framer-motion";
import aboutImg from "../assets/about.png";

function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="theme-page px-6 pt-28 sm:px-8 md:px-20 md:pt-40"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:items-start">
        <motion.img
          src={aboutImg}
          alt="Our Team"
          className="theme-card w-full rounded-xl md:w-1/2"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        <motion.div
          className="space-y-6 md:w-1/2"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="theme-accent text-3xl font-bold sm:text-4xl md:text-5xl">
            About Us
          </h1>
          <p className="theme-text-muted text-base leading-relaxed sm:text-lg md:text-xl">
            RaftaarX is dedicated to delivering high-quality learning experiences
            with speed and efficiency. Our team of passionate developers, designers,
            and educators work together to create intuitive, interactive, and
            engaging solutions for learners worldwide.
          </p>
          <p className="theme-text-muted text-base leading-relaxed sm:text-lg md:text-xl">
            Our mission is simple: make learning faster, smoother, and enjoyable.
            We believe in innovation, creativity, and a user-first approach to
            every project we take on.
          </p>
          <button className="theme-primary-button rounded-lg px-6 py-3 font-semibold transition-transform duration-300 hover:scale-105">
            Learn More
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default About;
