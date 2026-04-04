import React from "react";
import { useNavigate } from "react-router-dom";

import heroImage from "../assets/hero.jpeg";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-4 pt-28 sm:px-6">
      <img
        src={heroImage}
        alt="hero"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
          Welcome to <span className="text-yellow-400">RaftaarX</span>
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-base text-gray-300 sm:text-lg">
          RaftaarX - Where Speed Meets Comfort.
        </p>

        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-5 py-3 text-sm font-semibold text-black transition hover:scale-105 sm:px-6 sm:text-base"
        >
          Book Now
        </button>
      </div>
    </section>
  );
}

export default Hero;
