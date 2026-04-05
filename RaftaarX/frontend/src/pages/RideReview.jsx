import React, { useMemo } from "react";
import {
  ArrowRight,
  Clock3,
  IndianRupee,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader.jsx";
import RideMapCard from "../components/RideMapCard.jsx";
import {
  buildRideSuggestions,
  calculateDistanceKm,
  calculateDurationMinutes,
  calculateFare,
  getLocationPoint,
} from "../lib/ride.js";

function RideReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state?.draft || null;

  const rideData = useMemo(() => {
    if (!draft) {
      return null;
    }

    const pickupPoint = getLocationPoint(draft.pickup);
    const destinationPoint = getLocationPoint(draft.destination);
    const distanceKm = calculateDistanceKm(pickupPoint, destinationPoint);
    const estimatedFare = calculateFare(draft.vehicle, distanceKm);
    const durationMinutes = calculateDurationMinutes(draft.vehicle, distanceKm);

    return {
      ...draft,
      pickupPoint,
      destinationPoint,
      distanceKm,
      estimatedFare,
      durationMinutes,
      suggestions: buildRideSuggestions(draft.vehicle, distanceKm),
    };
  }, [draft]);

  if (!rideData) {
    navigate("/user");
    return null;
  }

  const checkpoints = [
    "Nearest partner request broadcast",
    "Pickup ETA shared after assignment",
    "Trip moved to payment only after service completion",
  ];

  return (
    <div className="theme-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          eyebrow="Ride Review"
          title="Review your route before booking"
          subtitle="Distance, fare, ETA aur service notes confirm karke hi request live market me jayegi."
          badge="Step 2 of 5"
          quickLinks={[
            { label: "Booking", to: "/user" },
            { label: "Review", to: "/ride-review", state: { draft } },
            { label: "Tracking", to: "/ride-status", state: { rideData } },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <MapPinned className="theme-accent h-5 w-5" />
                <div>
                  <h2 className="text-2xl font-black">Trip summary</h2>
                  <p className="theme-text-muted text-sm">
                    Pickup se destination tak booking ke core details yahan lock ho rahi hain.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Pickup point</p>
                  <p className="mt-2 text-lg font-semibold">{rideData.pickup}</p>
                </div>
                <div className="theme-card-soft rounded-2xl p-4">
                  <p className="theme-text-soft text-sm">Destination</p>
                  <p className="mt-2 text-lg font-semibold">{rideData.destination}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="theme-card-soft rounded-2xl p-4">
                    <p className="theme-text-soft text-sm">Vehicle</p>
                    <p className="mt-2 text-lg font-semibold capitalize">{rideData.vehicle}</p>
                  </div>
                  <div className="theme-card-soft rounded-2xl p-4">
                    <p className="theme-text-soft text-sm">Distance</p>
                    <p className="mt-2 text-lg font-semibold">{rideData.distanceKm} km</p>
                  </div>
                  <div className="theme-card-soft rounded-2xl p-4">
                    <p className="theme-text-soft text-sm">ETA</p>
                    <p className="mt-2 text-lg font-semibold">{rideData.durationMinutes} min</p>
                  </div>
                  <div className="theme-card-soft rounded-2xl p-4">
                    <p className="theme-text-soft text-sm">Fare</p>
                    <p className="mt-2 text-lg font-semibold">
                      <IndianRupee className="mb-1 inline h-4 w-4" />
                      {rideData.estimatedFare}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <RideMapCard
              start={rideData.pickupPoint}
              end={rideData.destinationPoint}
              progress={30}
              heading="Route preview"
              helperText="This is the path reference that will be shown during the live booking stage."
            />
          </div>

          <div className="space-y-6">
            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="theme-accent h-5 w-5" />
                <div>
                  <h2 className="text-2xl font-black">Service guidance</h2>
                  <p className="theme-text-muted text-sm">
                    Route length aur selected vehicle ke hisaab se useful recommendations.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {rideData.suggestions.map((suggestion) => (
                  <div key={suggestion} className="theme-card-soft rounded-2xl px-4 py-3 text-sm leading-6">
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="theme-accent h-5 w-5" />
                <div>
                  <h2 className="text-2xl font-black">What happens next</h2>
                  <p className="theme-text-muted text-sm">
                    Booking request submit hone ke baad system ye sequence follow karega.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {checkpoints.map((item, index) => (
                  <div key={item} className="theme-card-soft flex gap-3 rounded-2xl p-4">
                    <div className="theme-primary-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                <div className="flex items-center gap-3">
                  <Clock3 className="theme-accent h-5 w-5" />
                  <p className="text-sm">
                    Average partner allocation for this route is usually within 2 to 4 minutes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/ride-status", { state: { rideData } })}
                className="theme-primary-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold"
              >
                Book now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideReview;
