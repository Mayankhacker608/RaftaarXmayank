import React, { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Shield, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (booking) {
      return undefined;
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
    { label: "UPI", value: "upi", icon: Wallet, note: "Fastest checkout" },
    { label: "Card", value: "card", icon: CreditCard, note: "Visa, Mastercard, RuPay" },
    { label: "Cash", value: "cash", icon: Shield, note: "Pay after service completion" },
  ];

  const confirmPayment = async () => {
    if (!booking?._id || booking.serviceStage === "paid") {
      setMessage("Payment already confirmed for this booking.");
      return;
    }

    if (booking.serviceStage !== "payment_pending") {
      setMessage("Payment will unlock after the partner marks the service as completed.");
      return;
    }

    try {
      setPaying(true);
      const response = await api.patch(
        `/bookings/${booking._id}/stage`,
        {
          status: "completed",
          serviceStage: "paid",
          paymentMethod: selectedMethod,
        },
        token
      );

      setBooking(response.booking);
      setMessage("Payment confirmed. Booking is now marked as completed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center">
        Loading payment details...
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="theme-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          eyebrow="Payment"
          title="Complete the booking payment"
          subtitle="Once the service is completed, payment can be confirmed here to close the trip."
          badge="Step 5 of 5"
          quickLinks={[
            { label: "Booking", to: "/user" },
            { label: "Tracking", to: "/ride-status" },
            { label: "Payment", to: "/payment", state: { booking } },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="theme-card rounded-[30px] p-5 sm:p-6">
            <p className="theme-accent text-xs font-semibold uppercase tracking-[0.3em]">
              Booking Summary
            </p>
            <h2 className="mt-3 text-3xl font-black">Review the final trip details</h2>

            <div className="mt-6 space-y-4">
              <div className="theme-card-soft rounded-2xl p-4">
                <p className="theme-text-soft text-sm">Pickup</p>
                <p className="mt-1 text-lg font-semibold">{booking.pickup}</p>
              </div>
              <div className="theme-card-soft rounded-2xl p-4">
                <p className="theme-text-soft text-sm">Destination</p>
                <p className="mt-1 text-lg font-semibold">{booking.destination}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Vehicle</p>
                  <p className="mt-1 text-lg font-semibold capitalize">{booking.vehicle}</p>
                </div>
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Fare</p>
                  <p className="mt-1 text-lg font-semibold">Rs. {booking.estimatedFare || 0}</p>
                </div>
              </div>
              <div className="theme-card-soft rounded-2xl p-4">
                <p className="theme-text-soft text-sm">Booking stage</p>
                <p className="mt-1 text-lg font-semibold capitalize">
                  {(booking.serviceStage || booking.status || "").replaceAll("_", " ")}
                </p>
              </div>
              {booking.paymentMethod ? (
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Payment method</p>
                  <p className="mt-1 text-lg font-semibold uppercase">{booking.paymentMethod}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="theme-card rounded-[30px] p-5 sm:p-6">
            <h2 className="text-3xl font-black">Choose payment method</h2>
            <p className="theme-text-muted mt-2 text-sm">
              For the demo, this action will transition the booking to the final paid state using the selected method.
            </p>

            <div className="mt-6 grid gap-4">
              {paymentOptions.map(({ label, value, icon, note }) => {
                const selected = selectedMethod === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedMethod(value)}
                    className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                      selected ? "theme-chip" : "theme-card-soft"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {React.createElement(icon, { className: "theme-accent h-5 w-5" })}
                      <div>
                        <span className="block font-semibold">{label}</span>
                        <span className="theme-text-soft text-xs">{note}</span>
                      </div>
                    </div>
                    {selected ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : null}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmPayment}
              disabled={
                paying ||
                booking.serviceStage === "paid" ||
                booking.serviceStage !== "payment_pending"
              }
              className="theme-primary-button mt-6 w-full rounded-2xl px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {booking.serviceStage === "paid"
                ? "Payment already completed"
                : paying
                  ? "Confirming payment..."
                  : booking.serviceStage !== "payment_pending"
                    ? "Payment unlocks after service completion"
                  : `Pay with ${selectedMethod.toUpperCase()}`}
            </button>

            {message ? (
              <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
