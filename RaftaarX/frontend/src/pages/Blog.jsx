import React from "react";
import { motion } from "framer-motion";

import blogDesign from "../assets/blog-design.svg";
import blogProductivity from "../assets/blog-productivity.svg";
import blogSecurity from "../assets/blog-security.svg";

function Blog() {
  const blogPosts = [
    {
      title: "5 Tips to Boost Productivity",
      description:
        "Discover effective strategies to stay focused and increase your productivity throughout the day.",
      image: blogProductivity,
      date: "April 1, 2026",
    },
    {
      title: "How to Secure Your Online Account",
      description:
        "Learn the best practices to protect your accounts and personal data from cyber threats.",
      image: blogSecurity,
      date: "March 25, 2026",
    },
    {
      title: "Top UI/UX Trends in 2026",
      description:
        "Explore the latest UI/UX design trends that are shaping the digital landscape this year.",
      image: blogDesign,
      date: "March 20, 2026",
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
          Our Blog
        </motion.h1>

        <motion.p
          className="max-w-3xl text-center text-lg leading-relaxed text-gray-300 md:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Stay updated with the latest tips, tutorials, and insights from RaftaarX.
        </motion.p>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              className="flex flex-col overflow-hidden rounded-2xl bg-gray-800/60 shadow-lg backdrop-blur-md"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <img src={post.image} alt={post.title} className="h-48 w-full object-cover" />
              <div className="flex flex-1 flex-col p-6">
                <h2 className="mb-2 text-2xl font-semibold text-yellow-400">
                  {post.title}
                </h2>
                <p className="flex-1 text-base text-gray-300">{post.description}</p>
                <p className="mt-4 text-sm text-gray-400">{post.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Blog;
