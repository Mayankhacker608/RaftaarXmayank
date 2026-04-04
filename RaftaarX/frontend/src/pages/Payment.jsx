import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CreditCard, Shield, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (booking) {
      return;
    }

    let active = true;

    api
      .get("/bookings/me", token)
      .then((response) => {
        if (!active) {
          return;
        }

        if (response.bookings.length) {
          setBooking(response.bookings[0]);
          return;
        }

        navigate("/user");
      })
      .catch(() => {
        if (active) {
          navigate("/user");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [booking, navigate, token]);

  const paymentOptions = [
    { label: "UPI", value: "upi", icon: Wallet },
    { label: "Card", value: "card", icon: CreditCard },
    { label: "Cash", value: "cash", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading payment details...
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 py-10 text-white sm:px-6 sm:py-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        type="button"
        onClick={() => navigate("/user")}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to booking
      </button>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
            Booking Summary
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">Payment Confirmation</h1>
          <div className="mt-8 space-y-4 text-gray-300">
            <div className="rounded-2xl bg-black/30 p-4">
              <p className="text-sm text-gray-400">Pickup</p>
              <p className="mt-1 text-lg text-white">{booking.pickup}</p>
            </div>
            <div className="rounded-2xl bg-black/30 p-4">
              <p className="text-sm text-gray-400">Destination</p>
              <p className="mt-1 text-lg text-white">{booking.destination}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-sm text-gray-400">Vehicle</p>
                <p className="mt-1 text-lg capitalize text-white">{booking.vehicle}</p>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-sm text-gray-400">Status</p>
                <p className="mt-1 text-lg capitalize text-white">{booking.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-yellow-500/20 bg-gray-950/80 p-5 sm:p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Choose payment method
          </h2>
          <div className="mt-6 grid gap-4">
            {paymentOptions.map(({ label, value, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMethod(value)}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                  selectedMethod === value
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {React.createElement(icon, {
                    className: "h-5 w-5 text-yellow-400",
                  })}
                  <span>{label}</span>
                </div>
                {selectedMethod === value && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-sm text-green-200">
            Booking save ho chuki hai. Is demo flow me payment confirmation UI ready
            hai; actual payment gateway aage integrate kar sakte hain.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Payment;
