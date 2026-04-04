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
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-6 pt-28 text-white sm:px-8 md:px-20 md:pt-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
        <motion.h1
          className="text-center text-4xl font-bold text-yellow-400 md:text-5xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Support Center
        </motion.h1>

        <motion.p
          className="max-w-3xl text-center text-lg text-gray-300 md:text-xl"
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
              className="flex flex-col items-center rounded-2xl bg-gray-800/60 p-6 text-center shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <resource.Icon className="mb-4 h-14 w-14 text-yellow-400" />
              <h2 className="mb-2 text-2xl font-semibold text-yellow-400">
                {resource.title}
              </h2>
              <p className="text-gray-300">{resource.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 w-full rounded-2xl bg-gray-800/60 p-6 shadow-lg backdrop-blur-md md:w-2/3 md:p-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="mb-4 text-center text-2xl font-bold text-yellow-400">
            Need Assistance?
          </h3>
          <p className="mb-6 text-center text-gray-300">
            If you can&apos;t find what you&apos;re looking for, send us a message and our
            support team will help you promptly.
          </p>
          <form className="flex flex-col gap-4">
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
              placeholder="Your Question"
              rows="4"
              className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 font-semibold text-black transition-transform duration-300 hover:scale-105"
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
