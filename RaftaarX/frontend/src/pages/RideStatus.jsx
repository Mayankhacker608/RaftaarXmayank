import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  MapPinned,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader.jsx";
import RideMapCard from "../components/RideMapCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

const stageMeta = {
  finding_driver: {
    title: "Finding the nearest partner",
    note: "Request nearby approved partners ke paas broadcast ho chuki hai.",
    progress: 20,
  },
  partner_assigned: {
    title: "Partner assigned",
    note: "A partner has accepted your booking and is preparing for pickup.",
    progress: 48,
  },
  ride_in_progress: {
    title: "Partner is on the way",
    note: "Service has started and live route movement is now active.",
    progress: 76,
  },
  payment_pending: {
    title: "Service completed",
    note: "Trip complete ho gayi hai. Payment confirm karke booking close kijiye.",
    progress: 94,
  },
  paid: {
    title: "Booking closed",
    note: "Payment received. This booking is fully completed.",
    progress: 100,
  },
};

function RideStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const rideData = location.state?.rideData || null;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchPulse, setSearchPulse] = useState(0);

  useEffect(() => {
    let active = true;

    const createBooking = async () => {
      if (!rideData) {
        navigate("/user");
        return;
      }

      try {
        const response = await api.post(
          "/bookings",
          {
            pickup: rideData.pickup,
            pickupLocation: rideData.pickupPoint,
            destination: rideData.destination,
            destinationLocation: rideData.destinationPoint,
            vehicle: rideData.vehicle,
            mobileNumber: rideData.mobileNumber,
            distanceKm: rideData.distanceKm,
            estimatedFare: rideData.estimatedFare,
          },
          token
        );

        if (active) {
          setBooking(response.booking);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    createBooking();

    return () => {
      active = false;
    };
  }, [navigate, rideData, token]);

  useEffect(() => {
    if (!booking) {
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const response = await api.get("/bookings/me", token);
        const latestBooking =
          response.bookings.find((item) => item._id === booking._id) || response.bookings[0];

        if (latestBooking) {
          setBooking(latestBooking);
        }
      } catch {
        // polling remains silent in demo mode
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [booking, token]);

  useEffect(() => {
    if (booking?.serviceStage !== "finding_driver") {
      return undefined;
    }

    const pulseInterval = setInterval(() => {
      setSearchPulse((previous) => (previous >= 8 ? 0 : previous + 1));
    }, 900);

    return () => clearInterval(pulseInterval);
  }, [booking?.serviceStage]);

  const currentStage = booking?.serviceStage || "finding_driver";
  const currentMeta = stageMeta[currentStage] || stageMeta.finding_driver;
  const mapProgress =
    currentStage === "finding_driver"
      ? currentMeta.progress + searchPulse
      : currentMeta.progress;

  const stages = useMemo(
    () => [
      {
        label: "Driver Finding",
        active: true,
      },
      {
        label: "Partner Assigned",
        active: ["partner_assigned", "ride_in_progress", "payment_pending", "paid"].includes(
          currentStage
        ),
      },
      {
        label: "Service Running",
        active: ["ride_in_progress", "payment_pending", "paid"].includes(currentStage),
      },
      {
        label: "Payment",
        active: ["payment_pending", "paid"].includes(currentStage),
      },
      {
        label: "Complete",
        active: currentStage === "paid",
      },
    ],
    [currentStage]
  );

  if (loading) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center">
        Creating your booking...
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
          eyebrow="Live Tracking"
          title={currentMeta.title}
          subtitle={currentMeta.note}
          badge="Step 3 of 5"
          quickLinks={[
            { label: "Booking", to: "/user" },
            { label: "Review", to: "/ride-review", state: { draft: rideData } },
            { label: "Tracking", to: "/ride-status", state: { rideData } },
            {
              label: "Payment",
              to: "/payment",
              state: { booking },
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="grid gap-3 md:grid-cols-5">
                {stages.map((stage, index) => (
                  <div key={stage.label} className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                        stage.active ? "theme-primary-button" : "theme-secondary-button"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`text-sm ${stage.active ? "" : "theme-text-soft"}`}>
                      {stage.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Booking progress</p>
                  <span className="theme-accent font-semibold">{mapProgress}%</span>
                </div>
                <div className="theme-progress-track mt-3">
                  <div className="theme-progress-bar" style={{ width: `${mapProgress}%` }} />
                </div>
              </div>
            </div>

            <RideMapCard
              start={booking.pickupLocation || rideData?.pickupPoint}
              end={booking.destinationLocation || rideData?.destinationPoint}
              progress={mapProgress}
              heading="Live route map"
              helperText="Partner assignment aur trip stage ke saath map indicator update hota rahega."
            />
          </div>

          <div className="space-y-6">
            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                {booking.partner ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Search className="theme-accent h-5 w-5" />
                )}
                <div>
                  <h2 className="text-2xl font-black">Booking details</h2>
                  <p className="theme-text-muted text-sm">
                    Current partner assignment, route info aur booking state.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="theme-card-soft rounded-2xl px-4 py-3">
                  Route: {booking.pickup} to {booking.destination}
                </div>
                <div className="theme-card-soft rounded-2xl px-4 py-3 capitalize">
                  Vehicle: {booking.vehicle}
                </div>
                <div className="theme-card-soft rounded-2xl px-4 py-3">
                  Fare estimate: Rs. {booking.estimatedFare || rideData?.estimatedFare || 0}
                </div>
                <div className="theme-card-soft rounded-2xl px-4 py-3">
                  Contact number: {booking.mobileNumber || rideData?.mobileNumber || "Not added"}
                </div>
                <div className="theme-card-soft rounded-2xl px-4 py-3">
                  {booking.partner
                    ? `Assigned partner: ${booking.partner.name}`
                    : "Searching for the nearest approved partner..."}
                </div>
              </div>
            </div>

            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="theme-accent h-5 w-5" />
                <div>
                  <h2 className="text-2xl font-black">Status notes</h2>
                  <p className="theme-text-muted text-sm">
                    Ye panel current booking stage ka exact meaning dikhata hai.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="font-semibold">{currentMeta.title}</p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">{currentMeta.note}</p>
                </div>
                <div className="theme-card-soft flex items-start gap-3 rounded-2xl p-4">
                  <Clock3 className="theme-accent mt-0.5 h-5 w-5" />
                  <p className="text-sm leading-6">
                    {booking.partner
                      ? "Partner dashboard se ride stage update hote hi yahan instantly reflect hoga."
                      : "Driver is finding stage me request open bookings pool me visible hai."}
                  </p>
                </div>
                <div className="theme-card-soft flex items-start gap-3 rounded-2xl p-4">
                  <MapPinned className="theme-accent mt-0.5 h-5 w-5" />
                  <p className="text-sm leading-6">
                    Booking payment screen tab unlock hogi jab partner service ko completed mark karega.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/payment", { state: { booking } })}
                disabled={!["payment_pending", "paid"].includes(currentStage)}
                className="theme-primary-button mt-6 w-full rounded-2xl px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentStage === "paid" ? "View completed payment" : "Continue to payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideStatus;
