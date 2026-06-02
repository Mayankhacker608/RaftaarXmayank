import React, { useMemo, useState } from "react";
import {
  Bike,
  Car,
  CarFront,
  IndianRupee,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader.jsx";
import RideMapCard from "../components/RideMapCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import {
  calculateDistanceKm,
  calculateDurationMinutes,
  calculateFare,
  getLocationPoint,
  suggestLocations,
} from "../lib/ride.js";

const vehicleOptions = [
  {
    label: "Bike",
    value: "bike",
    icon: Bike,
    eta: "Fastest city pickup",
    note: "Best for short routes and traffic-heavy areas",
  },
  {
    label: "Cab",
    value: "cab",
    icon: Car,
    eta: "Comfort ride",
    note: "Better for longer trips and luggage",
  },
  {
    label: "Auto",
    value: "auto",
    icon: CarFront,
    eta: "Balanced fare",
    note: "Useful for everyday city travel",
  },
];

function User() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState("bike");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");

  const pickupSuggestions = useMemo(() => suggestLocations(pickup), [pickup]);
  const destinationSuggestions = useMemo(
    () => suggestLocations(destination),
    [destination]
  );

  const preview = useMemo(() => {
    const pickupPoint = getLocationPoint(pickup);
    const destinationPoint = getLocationPoint(destination);
    const distanceKm = calculateDistanceKm(pickupPoint, destinationPoint);
    const estimatedFare = calculateFare(vehicle, distanceKm);
    const durationMinutes = calculateDurationMinutes(vehicle, distanceKm);

    return {
      pickupPoint,
      destinationPoint,
      distanceKm,
      estimatedFare,
      durationMinutes,
    };
  }, [destination, pickup, vehicle]);

  const readiness = useMemo(() => {
    return [vehicle, mobileNumber, pickup, destination].filter(Boolean).length * 25;
  }, [destination, mobileNumber, pickup, vehicle]);

  const handleNext = () => {
    if (!pickup || !destination || !vehicle || !mobileNumber) {
      setError("Vehicle, contact number, pickup aur destination bharna zaroori hai.");
      return;
    }

    if (mobileNumber.trim().length < 10) {
      setError("Valid mobile number enter kijiye.");
      return;
    }

    if (!preview.pickupPoint || !preview.destinationPoint) {
      setError("Pickup aur destination suggestion list se select kijiye.");
      return;
    }

    setError("");
    navigate("/ride-review", {
      state: {
        draft: {
          vehicle,
          mobileNumber,
          pickup: preview.pickupPoint.label,
          destination: preview.destinationPoint.label,
        },
      },
    });
  };

  return (
    <div className="theme-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          eyebrow="User Workspace"
          title={`Welcome back, ${user?.name || "Rider"}`}
          subtitle="Trip set karo, real-time estimate dekho, aur next screen par route verify karke booking confirm karo."
          badge="User"
          quickLinks={[
            { label: "New booking", to: "/user" },
            { label: "Tracking", to: "/ride-status" },
            { label: "Payment", to: "/payment" },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="theme-accent text-xs font-semibold uppercase tracking-[0.3em]">
                    Booking Flow
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Choose your service</h2>
                </div>
                <div className="theme-card-soft rounded-full px-4 py-2 text-sm">
                  Step 1 of 5
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {vehicleOptions.map(({ label, value, icon, eta, note }) => {
                  const active = vehicle === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVehicle(value)}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        active ? "theme-chip" : "theme-card-soft"
                      }`}
                    >
                      {React.createElement(icon, { className: "theme-accent h-8 w-8" })}
                      <p className="mt-4 text-lg font-semibold">{label}</p>
                      <p className="theme-text-muted mt-1 text-sm">{eta}</p>
                      <p className="theme-text-soft mt-2 text-xs leading-5">{note}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <h2 className="text-2xl font-black">Route and contact details</h2>
              <p className="theme-text-muted mt-2 text-sm">
                Pickup aur destination list se choose karne par distance aur route preview automatically update hoga.
              </p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="theme-text-muted mb-2 block text-sm font-medium">
                    Mobile number
                  </span>
                  <div className="theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                    <Phone className="theme-accent h-5 w-5" />
                    <input
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      placeholder="10-digit contact number"
                      className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)]"
                    />
                  </div>
                </label>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="theme-text-muted mb-2 block text-sm font-medium">
                      Pickup point
                    </span>
                    <div className="theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <input
                        value={pickup}
                        onChange={(event) => setPickup(event.target.value)}
                        placeholder="Search pickup location"
                        className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)]"
                      />
                    </div>
                    {pickupSuggestions.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pickupSuggestions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPickup(item)}
                            className="theme-secondary-button rounded-full px-3 py-1.5 text-xs"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="theme-text-muted mb-2 block text-sm font-medium">
                      Destination
                    </span>
                    <div className="theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <input
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        placeholder="Search destination"
                        className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)]"
                      />
                    </div>
                    {destinationSuggestions.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {destinationSuggestions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setDestination(item)}
                            className="theme-secondary-button rounded-full px-3 py-1.5 text-xs"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="theme-accent h-5 w-5" />
                <div>
                  <h2 className="text-2xl font-black">Trip preview</h2>
                  <p className="theme-text-muted text-sm">
                    Fare, ETA aur route readiness live update ho rahi hai.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Distance</p>
                  <p className="mt-2 text-2xl font-bold">{preview.distanceKm} km</p>
                </div>
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">ETA</p>
                  <p className="mt-2 text-2xl font-bold">{preview.durationMinutes} min</p>
                </div>
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Estimated fare</p>
                  <p className="mt-2 text-2xl font-bold">
                    <IndianRupee className="mb-1 inline h-5 w-5" />
                    {preview.estimatedFare}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Booking readiness</p>
                  <span className="theme-accent font-semibold">{readiness}%</span>
                </div>
                <div className="theme-progress-track mt-3">
                  <div className="theme-progress-bar" style={{ width: `${readiness}%` }} />
                </div>
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleNext}
                className="theme-primary-button mt-6 w-full rounded-2xl px-6 py-4 font-bold"
              >
                Continue to route review
              </button>
            </div>

            <RideMapCard
              start={preview.pickupPoint}
              end={preview.destinationPoint}
              progress={18}
              heading="Route map"
              helperText="Pickup aur drop points yahan verify kar sakte ho before confirming the booking."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
