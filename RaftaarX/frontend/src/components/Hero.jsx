import React from "react";
import { useNavigate } from "react-router-dom";

import heroImage from "../assets/hero.jpeg";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      <img
        src={heroImage}
        alt="hero"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 px-6 text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-white md:text-6xl">
          Welcome to <span className="text-yellow-400">RaftaarX</span>
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-gray-300">
          RaftaarX - Where Speed Meets Comfort.
        </p>

        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 font-semibold text-black transition hover:scale-105"
        >
          Book Now
        </button>
      </div>
    </section>
  );
}

export default Hero;
