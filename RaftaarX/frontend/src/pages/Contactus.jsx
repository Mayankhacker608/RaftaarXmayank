import React from "react";
import { motion } from "framer-motion";

function ContactUs() {
  return (
    <motion.div
      className="theme-page px-6 pt-28 sm:px-8 md:px-20 md:pt-40"
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
          <h1 className="theme-accent text-3xl font-bold sm:text-4xl md:text-5xl">
            Contact Us
          </h1>
          <p className="theme-text-muted text-base leading-relaxed sm:text-lg md:text-xl">
            Have questions or need assistance? Reach out to our team and we&apos;ll
            respond as quickly as possible.
          </p>
          <div className="space-y-4">
            <p>
              <span className="theme-accent font-semibold">Email:</span>{" "}
              support@raftaarx.com
            </p>
            <p>
              <span className="theme-accent font-semibold">Phone:</span> +91
              12345 67890
            </p>
            <p>
              <span className="theme-accent font-semibold">Address:</span> 123
              Tech Street, Your City, India
            </p>
          </div>
        </motion.div>

        <motion.form
          className="theme-card flex flex-col gap-6 rounded-2xl p-6 md:w-1/2 md:p-10"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <input
            type="text"
            placeholder="Your Name"
            className="theme-input px-4 py-3"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="theme-input px-4 py-3"
          />
          <textarea
            placeholder="Your Message"
            rows="5"
            className="theme-input px-4 py-3"
          />
          <button
            type="submit"
            className="theme-primary-button rounded-lg px-6 py-3 font-semibold transition-transform duration-300 hover:scale-105"
          >
            Send Message
          </button>
        </motion.form>
      </div>
    </motion.div>
  );
}

export default ContactUs;
