import React from "react";
import { motion } from "framer-motion";
import { CircleHelp, Headset, ShieldCheck } from "lucide-react";

function Support() {
  const supportResources = [
    {
      title: "FAQs",
      description: "Find answers to the most common questions about our services.",
      Icon: CircleHelp,
    },
    {
      title: "Technical Support",
      description: "Report technical issues and get help from our expert team.",
      Icon: Headset,
    },
    {
      title: "Account Assistance",
      description: "Need help with your account? Our team is ready to assist you.",
      Icon: ShieldCheck,
    },
  ];

  return (
    <motion.div
      className="theme-page px-6 pt-28 sm:px-8 md:px-20 md:pt-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
        <motion.h1
          className="theme-accent text-center text-4xl font-bold md:text-5xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Support Center
        </motion.h1>

        <motion.p
          className="theme-text-muted max-w-3xl text-center text-lg md:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          We&apos;re here to make your experience smooth. Explore our resources or reach
          out for personal assistance.
        </motion.p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10">
          {supportResources.map((resource, index) => (
            <motion.div
              key={index}
              className="theme-card flex flex-col items-center rounded-2xl p-6 text-center transition-transform duration-300 hover:scale-105"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <resource.Icon className="theme-accent mb-4 h-14 w-14" />
              <h2 className="theme-accent mb-2 text-2xl font-semibold">
                {resource.title}
              </h2>
              <p className="theme-text-muted">{resource.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="theme-card mt-16 w-full rounded-2xl p-6 md:w-2/3 md:p-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="theme-accent mb-4 text-center text-2xl font-bold">
            Need Assistance?
          </h3>
          <p className="theme-text-muted mb-6 text-center">
            If you can&apos;t find what you&apos;re looking for, send us a message and our
            support team will help you promptly.
          </p>
          <form className="flex flex-col gap-4">
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
              placeholder="Your Question"
              rows="4"
              className="theme-input px-4 py-3"
            />
            <button
              type="submit"
              className="theme-primary-button rounded-lg px-6 py-3 font-semibold transition-transform duration-300 hover:scale-105"
            >
              Submit
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Support;
