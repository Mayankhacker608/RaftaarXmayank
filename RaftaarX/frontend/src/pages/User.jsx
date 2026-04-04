import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bike, Car, CarFront, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

function User() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [vehicle, setVehicle] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!pickup || !destination || !vehicle) {
      setError("Pickup, destination, aur vehicle select karna zaroori hai.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const response = await api.post(
        "/bookings",
        { pickup, destination, vehicle },
        token
      );
      navigate("/payment", { state: { booking: response.booking } });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6 font-sans text-white"
    >
      <motion.button
        type="button"
        onClick={() => navigate("/auth")}
        whileHover={{ scale: 1.05 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 shadow-lg"
      >
        <ArrowLeft className="text-yellow-400" />
        Back
      </motion.button>

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-3 text-center text-4xl font-extrabold tracking-wide text-yellow-400 md:text-5xl"
      >
        Book Your Ride
      </motion.h1>
      <p className="mb-10 text-center text-gray-300">
        Welcome, {user?.name}. Ride details save hone ke baad aap payment page par chale jayenge.
      </p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mx-auto mb-10 max-w-md rounded-2xl bg-gray-900 p-6 shadow-2xl"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3 transition hover:ring-2 hover:ring-yellow-500">
            <MapPin className="text-green-400" />
            <input
              type="text"
              value={pickup}
              onChange={(event) => setPickup(event.target.value)}
              placeholder="From location"
              className="w-full bg-transparent p-2 font-medium text-white outline-none placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3 transition hover:ring-2 hover:ring-yellow-500">
            <MapPin className="text-red-400" />
            <input
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="To destination"
              className="w-full bg-transparent p-2 font-medium text-white outline-none placeholder-gray-400"
            />
          </div>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-6 text-center text-2xl font-semibold"
      >
        Select Vehicle
      </motion.h2>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVehicle("bike")}
          className={`cursor-pointer rounded-2xl p-5 text-center shadow-lg transition-all ${
            vehicle === "bike"
              ? "bg-yellow-500 text-black shadow-yellow-400/50"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          <Bike className="mx-auto mb-3 h-28 w-28" />
          <p className="text-lg font-semibold">Bike</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVehicle("cab")}
          className={`cursor-pointer rounded-2xl p-5 text-center shadow-lg transition-all ${
            vehicle === "cab"
              ? "bg-yellow-500 text-black shadow-yellow-400/50"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          <Car className="mx-auto mb-3 h-28 w-28" />
          <p className="text-lg font-semibold">Cab</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVehicle("auto")}
          className={`cursor-pointer rounded-2xl p-5 text-center shadow-lg transition-all ${
            vehicle === "auto"
              ? "bg-yellow-500 text-black shadow-yellow-400/50"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          <CarFront className="mx-auto mb-3 h-28 w-28" />
          <p className="text-lg font-semibold">Auto</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10 text-center"
      >
        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl bg-yellow-500 px-10 py-3 font-bold text-black shadow-lg transition-all hover:shadow-yellow-400/50 disabled:opacity-70"
        >
          {submitting ? "Saving booking..." : "Continue to Payment ->"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default User;
