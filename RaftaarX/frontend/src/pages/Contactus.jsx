import React from "react";
import { motion } from "framer-motion";

function ContactUs() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-6 pt-32 text-white md:px-20 md:pt-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row">
        <motion.div
          className="flex flex-col gap-6 md:w-1/2"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-yellow-400 md:text-5xl">
            Contact Us
          </h1>
          <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
            Have questions or need assistance? Reach out to our team and we&apos;ll
            respond as quickly as possible.
          </p>
          <div className="space-y-4">
            <p>
              <span className="font-semibold text-yellow-400">Email:</span>{" "}
              support@raftaarx.com
            </p>
            <p>
              <span className="font-semibold text-yellow-400">Phone:</span> +91
              12345 67890
            </p>
            <p>
              <span className="font-semibold text-yellow-400">Address:</span> 123
              Tech Street, Your City, India
            </p>
          </div>
        </motion.div>

        <motion.form
          className="flex flex-col gap-6 rounded-2xl bg-gray-800/60 p-6 shadow-lg backdrop-blur-md md:w-1/2 md:p-10"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <input
            type="text"
            placeholder="Your Name"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <textarea
            placeholder="Your Message"
            rows="5"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 font-semibold text-black transition-transform duration-300 hover:scale-105"
          >
            Send Message
          </button>
        </motion.form>
      </div>
    </motion.div>
  );
}

export default ContactUs;
