import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Bike,
  CheckCircle2,
  FileText,
  ImagePlus,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

const onboardingSteps = [
  { key: "vehicle", label: "Vehicle" },
  { key: "documents", label: "Documents" },
  { key: "bank", label: "Bank" },
  { key: "review", label: "Review" },
  { key: "live", label: "Live" },
];

const requiredDocs = ["aadhar", "dl", "rc", "insurance"];

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Partner() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    fatherName: "",
    address: "",
    phoneNumber: "",
    vehicleType: "bike",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleColor: "",
    bikeNo: "",
    aadhar: null,
    dl: null,
    rc: null,
    insurance: null,
    bikeImages: [],
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    pricingPlan: "standard",
    pricePerKm: "12",
  });
  const [applications, setApplications] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPartnerData = useCallback(async () => {
    try {
      const [applicationsResponse, availableResponse, assignedResponse] = await Promise.all([
        api.get("/partners/me", token),
        api.get("/bookings/available", token).catch(() => ({ bookings: [] })),
        api.get("/bookings/assigned", token).catch(() => ({ bookings: [] })),
      ]);

      setApplications(applicationsResponse.applications);
      setAvailableBookings(availableResponse.bookings || []);
      setAcceptedBookings(assignedResponse.bookings || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  const latestApplication = applications[0] || null;
  const isApproved = latestApplication?.status === "approved";

  const progressPercent = useMemo(() => {
    if (currentStep === 4) {
      return 100;
    }

    return Math.round(((currentStep + 1) / onboardingSteps.length) * 100);
  }, [currentStep]);

  const handleChange = (event) => {
    const { name, files, value } = event.target;

    if (files) {
      if (name === "bikeImages") {
        setFormData((previous) => ({
          ...previous,
          bikeImages: Array.from(files),
        }));
        return;
      }

      setFormData((previous) => ({
        ...previous,
        [name]: files[0],
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const nextStep = () => setCurrentStep((previous) => Math.min(previous + 1, 4));
  const previousStep = () => setCurrentStep((previous) => Math.max(previous - 1, 0));

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.fatherName ||
      !formData.address ||
      !formData.phoneNumber ||
      !formData.vehicleBrand ||
      !formData.vehicleModel ||
      !formData.vehicleColor ||
      !formData.bikeNo ||
      !formData.aadhar ||
      !formData.dl ||
      !formData.rc ||
      !formData.insurance ||
      formData.bikeImages.length < 2
    ) {
      setError("Partner onboarding complete karne ke liye sab required fields bhariye.");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "bikeImages") {
        value.forEach((image) => payload.append("bikeImages", image));
        return;
      }

      if (value instanceof File) {
        payload.append(key, value);
        return;
      }

      payload.append(key, value);
    });

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const response = await api.post("/partners/applications", payload, token);
      setApplications((previous) => [response.application, ...previous]);
      setMessage("Partner onboarding submitted. Admin review pending.");
      setCurrentStep(4);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/accept`, {}, token);
      setAcceptedBookings((previous) => [response.booking, ...previous]);
      setAvailableBookings((previous) =>
        previous.filter((booking) => booking._id !== bookingId)
      );
    } catch (acceptError) {
      setError(acceptError.message);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Full Name</span>
            <input name="name" value={formData.name} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Father Name</span>
            <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Phone Number</span>
            <div className="theme-card flex items-center gap-3 rounded-2xl px-4 py-3">
              <Phone className="theme-accent h-5 w-5" />
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-transparent outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Address</span>
            <input name="address" value={formData.address} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Vehicle Brand</span>
            <input name="vehicleBrand" value={formData.vehicleBrand} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Vehicle Model</span>
            <input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Vehicle Color</span>
            <input name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Vehicle Number</span>
            <input name="bikeNo" value={formData.bikeNo} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {requiredDocs.map((doc) => (
              <label key={doc} className="theme-card-soft block rounded-[28px] p-4">
                <span className="theme-text-muted mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
                  <FileText className="theme-accent h-4 w-4" />
                  {doc}
                </span>
                <input type="file" name={doc} onChange={handleChange} accept="image/*,.pdf" className="w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-semibold file:text-black" />
                <p className="theme-text-soft mt-3 text-xs">
                  {formData[doc] ? formData[doc].name : "No file selected"}
                </p>
              </label>
            ))}
          </div>

          <label className="theme-card-soft block rounded-[28px] p-4">
            <span className="theme-text-muted mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
              <ImagePlus className="theme-accent h-4 w-4" />
              Bike Images
            </span>
            <input type="file" name="bikeImages" multiple onChange={handleChange} accept="image/*" className="w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-semibold file:text-black" />
            <div className="mt-4 flex flex-wrap gap-3">
              {formData.bikeImages.map((image, index) => (
                <div key={`${image.name}-${index}`} className="overflow-hidden rounded-2xl border border-[var(--app-border)]">
                  <img src={URL.createObjectURL(image)} alt="Bike preview" className="h-20 w-20 object-cover" />
                </div>
              ))}
            </div>
          </label>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Bank Name</span>
            <input name="bankName" value={formData.bankName} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Account Holder</span>
            <input name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Account Number</span>
            <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">IFSC Code</span>
            <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="theme-input px-4 py-3" />
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Pricing Plan</span>
            <select name="pricingPlan" value={formData.pricingPlan} onChange={handleChange} className="theme-input px-4 py-3">
              <option value="standard">Standard</option>
              <option value="city-priority">City Priority</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="block">
            <span className="theme-text-muted mb-2 block text-sm">Price per km</span>
            <div className="theme-card flex items-center gap-3 rounded-2xl px-4 py-3">
              <Banknote className="theme-accent h-5 w-5" />
              <input name="pricePerKm" value={formData.pricePerKm} onChange={handleChange} className="w-full bg-transparent outline-none" />
            </div>
          </label>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="theme-card-soft rounded-[28px] p-5">
          <h3 className="text-xl font-semibold">Final review</h3>
          <div className="theme-text-muted mt-4 grid gap-3 text-sm md:grid-cols-2">
            <p>Name: {formData.name}</p>
            <p>Phone: {formData.phoneNumber}</p>
            <p>Vehicle: {formData.vehicleBrand} {formData.vehicleModel}</p>
            <p>Vehicle No: {formData.bikeNo}</p>
            <p>Bank: {formData.bankName}</p>
            <p>Price per km: Rs. {formData.pricePerKm}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="theme-card-soft rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="theme-accent h-5 w-5" />
            <h3 className="text-xl font-semibold">Live Bookings</h3>
          </div>

          {!isApproved ? (
            <p className="theme-text-soft mt-4 text-sm">
              Admin approval ke baad yahan available bookings dikhengi.
            </p>
          ) : availableBookings.length ? (
            <div className="mt-4 space-y-4">
              {availableBookings.map((booking) => (
                <div key={booking._id} className="theme-card rounded-2xl p-4">
                  <p className="font-semibold">
                    {booking.pickup} to {booking.destination}
                  </p>
                  <p className="theme-text-soft mt-1 text-sm">
                    {booking.user?.name} | {booking.vehicle} | Rs. {booking.estimatedFare || 0}
                  </p>
                  <button
                    type="button"
                    onClick={() => acceptBooking(booking._id)}
                    className="theme-primary-button mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    Accept booking
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="theme-text-soft mt-4 text-sm">No open bookings right now.</p>
          )}
        </div>

        <div className="theme-card-soft rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <Bike className="theme-accent h-5 w-5" />
            <h3 className="text-xl font-semibold">Accepted Bookings</h3>
          </div>
          {acceptedBookings.length ? (
            <div className="mt-4 space-y-4">
              {acceptedBookings.map((booking) => (
                <div key={booking._id} className="theme-card rounded-2xl p-4">
                  <p className="font-semibold">{booking.pickup} to {booking.destination}</p>
                  <p className="theme-text-soft mt-1 text-sm">
                    {booking.user?.name} | {formatDate(booking.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="theme-text-soft mt-4 text-sm">No accepted bookings yet.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="theme-page px-4 pb-6 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="theme-secondary-button mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <ArrowLeft className="theme-accent h-4 w-4" />
          Back to auth
        </button>

        <div className="theme-card rounded-[32px] p-5 sm:p-8">
          <p className="theme-accent text-sm uppercase tracking-[0.35em]">
            Partner Onboarding
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Welcome, {user?.name}
          </h1>
          <p className="theme-text-muted mt-3 max-w-3xl text-sm sm:text-base">
            Vehicle details, documents, bank review, admin verification aur live
            booking section ek connected flow me.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {onboardingSteps.map((step, index) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStep(index)}
                className="flex items-center gap-3 text-left"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    index <= currentStep ? "theme-primary-button" : "theme-secondary-button"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${index <= currentStep ? "" : "theme-text-soft"}`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">Progress</p>
              <span className="theme-accent font-bold">{progressPercent}%</span>
            </div>
            <div className="theme-progress-track mt-4">
              <div className="theme-progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="mt-8">{loading ? <p>Loading partner workspace...</p> : renderStepContent()}</div>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </p>
          )}

          {currentStep < 4 && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={previousStep}
                className="theme-secondary-button rounded-2xl px-5 py-3 font-semibold"
              >
                Previous
              </button>

              {currentStep === 3 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="theme-primary-button rounded-2xl px-5 py-3 font-semibold disabled:opacity-70"
                >
                  {submitting ? "Submitting..." : "Submit for admin review"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="theme-primary-button rounded-2xl px-5 py-3 font-semibold"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Partner;
