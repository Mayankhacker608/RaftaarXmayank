import React from "react";
import { motion } from "framer-motion";

import safetyAccount from "../assets/safety-account.svg";
import safetyPrivacy from "../assets/safety-privacy.svg";
import safetyTransactions from "../assets/safety-transactions.svg";

function Safety() {
  const safetyTips = [
    {
      title: "Secure Your Account",
      description:
        "Always use strong passwords and enable two-factor authentication to protect your account from unauthorized access.",
      image: safetyAccount,
    },
    {
      title: "Privacy Matters",
      description:
        "Do not share personal information publicly. Protect your private data and manage your privacy settings.",
      image: safetyPrivacy,
    },
    {
      title: "Safe Transactions",
      description:
        "Use trusted payment methods and avoid sharing financial information on unsecured platforms.",
      image: safetyTransactions,
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-6 pt-32 text-white md:px-20 md:pt-40"
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
          Safety Guidelines
        </motion.h1>

        <motion.p
          className="max-w-3xl text-center text-lg leading-relaxed text-gray-300 md:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          At RaftaarX, your safety is our top priority. Follow these guidelines to
          stay secure while using our platform.
        </motion.p>

        <div className="mt-10 flex flex-col gap-10 md:flex-row">
          {safetyTips.map((tip, index) => (
            <motion.div
              key={index}
              className="flex flex-1 flex-col items-center rounded-2xl bg-gray-800/60 p-6 text-center shadow-lg backdrop-blur-md"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <img
                src={tip.image}
                alt={tip.title}
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />
              <h2 className="mb-2 text-2xl font-semibold text-yellow-400">
                {tip.title}
              </h2>
              <p className="text-base text-gray-300">{tip.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Safety;
