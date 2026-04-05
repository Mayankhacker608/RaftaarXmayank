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
          Safety Guidelines
        </motion.h1>

        <motion.p
          className="theme-text-muted max-w-3xl text-center text-lg leading-relaxed md:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          At RaftaarX, your safety is our top priority. Follow these guidelines to
          stay secure while using our platform.
        </motion.p>

        <div className="mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-10">
          {safetyTips.map((tip, index) => (
            <motion.div
              key={index}
              className="theme-card flex h-full flex-col items-center rounded-2xl p-6 text-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <img
                src={tip.image}
                alt={tip.title}
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />
              <h2 className="theme-accent mb-2 text-2xl font-semibold">
                {tip.title}
              </h2>
              <p className="theme-text-muted text-base">{tip.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Safety;
