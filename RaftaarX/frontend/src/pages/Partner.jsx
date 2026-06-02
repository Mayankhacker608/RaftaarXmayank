import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  BellRing,
  Bike,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Flag,
  ImagePlus,
  Info,
  MapPin,
  Phone,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";
import { compressImage } from "../lib/image.js";
import LightboxModal from "../components/LightboxModal.jsx";

const onboardingSteps = [
  { key: "vehicle", label: "Vehicle" },
  { key: "documents", label: "Documents" },
  { key: "bank", label: "Bank" },
  { key: "review", label: "Review" },
  { key: "live", label: "Live" },
];

const requiredDocs = ["aadhar", "dl", "rc", "insurance"];
const maxBikeImages = 10;
const maxSingleUploadBytes = 2 * 1024 * 1024;
const maxSubmissionBytes = 4 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function prepareUploadFile(file, fieldName) {
  if (!file?.type?.startsWith("image/")) {
    return file;
  }

  if (fieldName === "bikeImages") {
    return compressImage(file, 900, 900, 0.68, 180 * 1024);
  }

  return compressImage(file, 1400, 1400, 0.74, 450 * 1024);
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const bookingStageMeta = {
  finding_driver: {
    label: "New request",
    note: "User driver finding screen par wait kar raha hai.",
  },
  partner_assigned: {
    label: "Accepted",
    note: "User ko accept notification mil chuki hai. Pickup ke liye nikle.",
  },
  ride_in_progress: {
    label: "Service running",
    note: "Ride active hai. Complete hone par payment unlock karein.",
  },
  payment_pending: {
    label: "Payment pending",
    note: "User ke payment screen par payment enabled hai.",
  },
  paid: {
    label: "Paid and complete",
    note: "Payment receive ho gayi. Booking close ho chuki hai.",
  },
};

function getBookingStageMeta(stage) {
  return bookingStageMeta[stage] || bookingStageMeta.finding_driver;
}

function maskAccount(value) {
  if (!value) {
    return "Not added";
  }

  return `****${String(value).slice(-4)}`;
}

function statusClass(status) {
  if (status === "approved" || status === "paid" || status === "completed") {
    return "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300";
  }

  if (status === "rejected") {
    return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  return "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-200";
}

function isFilled(value) {
  return Boolean(String(value || "").trim());
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
  const [updatingBookingId, setUpdatingBookingId] = useState("");
  const [requestDrawer, setRequestDrawer] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lightbox, setLightbox] = useState({ isOpen: false, title: "", file: null });

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

  useEffect(() => {
    if (applications.length) {
      setCurrentStep(4);
    }
  }, [applications.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPartnerData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchPartnerData]);

  const latestApplication = applications[0] || null;
  const isApproved = latestApplication?.status === "approved";
  const activeBookings = acceptedBookings.filter(
    (booking) => !["payment_pending", "paid"].includes(booking.serviceStage)
  );
  const paymentBookings = acceptedBookings.filter((booking) =>
    ["payment_pending", "paid"].includes(booking.serviceStage)
  );
  const totalEarnings = acceptedBookings
    .filter((booking) => booking.serviceStage === "paid")
    .reduce((sum, booking) => sum + Number(booking.estimatedFare || 0), 0);
  const completedBookings = acceptedBookings.filter(
    (booking) => booking.serviceStage === "paid"
  );
  const reviewGroups = useMemo(
    () => [
      {
        title: "Personal details",
        note: "Partner ki identity aur contact verification ke liye.",
        items: [
          {
            label: "Full name",
            value: formData.name,
            valid: isFilled(formData.name),
            hint: "Name required hai.",
          },
          {
            label: "Father name",
            value: formData.fatherName,
            valid: isFilled(formData.fatherName),
            hint: "Father name required hai.",
          },
          {
            label: "Phone number",
            value: formData.phoneNumber,
            valid: String(formData.phoneNumber || "").trim().length >= 10,
            hint: "10 digit phone number add karein.",
          },
          {
            label: "Address",
            value: formData.address,
            valid: isFilled(formData.address),
            hint: "Full address required hai.",
          },
        ],
      },
      {
        title: "Vehicle details",
        note: "Customer ko ride accept hone ke baad vehicle confidence milega.",
        items: [
          {
            label: "Vehicle brand",
            value: formData.vehicleBrand,
            valid: isFilled(formData.vehicleBrand),
            hint: "Brand add karein.",
          },
          {
            label: "Vehicle model",
            value: formData.vehicleModel,
            valid: isFilled(formData.vehicleModel),
            hint: "Model add karein.",
          },
          {
            label: "Vehicle color",
            value: formData.vehicleColor,
            valid: isFilled(formData.vehicleColor),
            hint: "Color add karein.",
          },
          {
            label: "Vehicle number",
            value: formData.bikeNo,
            valid: isFilled(formData.bikeNo),
            hint: "Registration number add karein.",
          },
        ],
      },
      {
        title: "Documents",
        note: "Admin approval ke liye documents complete hone chahiye.",
        items: [
          {
            label: "Aadhar",
            value: formData.aadhar?.name,
            valid: Boolean(formData.aadhar),
            hint: "Aadhar upload karein.",
          },
          {
            label: "Driving license",
            value: formData.dl?.name,
            valid: Boolean(formData.dl),
            hint: "DL upload karein.",
          },
          {
            label: "RC",
            value: formData.rc?.name,
            valid: Boolean(formData.rc),
            hint: "RC upload karein.",
          },
          {
            label: "Insurance",
            value: formData.insurance?.name,
            valid: Boolean(formData.insurance),
            hint: "Insurance upload karein.",
          },
          {
            label: "Bike photos",
            value: `${formData.bikeImages.length} selected`,
            valid:
              formData.bikeImages.length >= 2 &&
              formData.bikeImages.length <= maxBikeImages,
            hint: `At least 2 aur maximum ${maxBikeImages} bike photos upload karein.`,
          },
        ],
      },
      {
        title: "Bank and pricing",
        note: "Payment settlement aur earning estimate ke liye.",
        optional: true,
        items: [
          {
            label: "Bank name",
            value: formData.bankName,
            valid: isFilled(formData.bankName),
            hint: "Recommended for payout.",
            optional: true,
          },
          {
            label: "Account holder",
            value: formData.accountHolderName,
            valid: isFilled(formData.accountHolderName),
            hint: "Recommended for payout.",
            optional: true,
          },
          {
            label: "Account number",
            value: maskAccount(formData.accountNumber),
            valid: isFilled(formData.accountNumber),
            hint: "Recommended for payout.",
            optional: true,
          },
          {
            label: "IFSC code",
            value: formData.ifscCode,
            valid: isFilled(formData.ifscCode),
            hint: "Recommended for payout.",
            optional: true,
          },
          {
            label: "Pricing plan",
            value: formData.pricingPlan,
            valid: isFilled(formData.pricingPlan),
            hint: "Pricing plan selected rahe.",
          },
          {
            label: "Price per km",
            value: `Rs. ${formData.pricePerKm || 0}`,
            valid: Number(formData.pricePerKm) > 0,
            hint: "Valid price per km add karein.",
          },
        ],
      },
    ],
    [formData]
  );
  const requiredReviewItems = reviewGroups.flatMap((group) =>
    group.items.filter((item) => !item.optional)
  );
  const completedRequiredCount = requiredReviewItems.filter((item) => item.valid).length;
  const reviewReady = completedRequiredCount === requiredReviewItems.length;

  const progressPercent = useMemo(() => {
    if (currentStep === 4) {
      return 100;
    }

    return Math.round(((currentStep + 1) / onboardingSteps.length) * 100);
  }, [currentStep]);

  const removeBikeImage = (indexToRemove) => {
    setFormData((previous) => ({
      ...previous,
      bikeImages: previous.bikeImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  const getSubmissionSize = (data = formData) =>
    requiredDocs.reduce((total, doc) => total + (data[doc]?.size || 0), 0) +
    data.bikeImages.reduce((total, image) => total + (image?.size || 0), 0);

  const hasRequiredFiles = () =>
    requiredDocs.every((doc) => formData[doc] instanceof File) &&
    formData.bikeImages.length >= 2;

  const appendPartnerFormData = (payload) => {
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "bikeImages") {
        value.forEach((image) => {
          if (image instanceof File) {
            payload.append("bikeImages", image);
          }
        });
        return;
      }

      if (value instanceof File) {
        payload.append(key, value);
        return;
      }

      if (value === null || value === undefined || value === "") {
        return;
      }

      payload.append(key, String(value));
    });
  };

  const handleChange = async (event) => {
    const { name, files, value } = event.target;

    if (files) {
      if (name === "bikeImages") {
        setError("Selected images optimize ho rahi hain...");
        const newImages = await Promise.all(
          Array.from(files).map((file) => prepareUploadFile(file, name))
        );
        const oversizedImage = newImages.find(
          (image) => image.size > maxSingleUploadBytes
        );

        if (oversizedImage) {
          setError(
            `${oversizedImage.name} ${formatFileSize(
              oversizedImage.size
            )} hai. Har image ${formatFileSize(maxSingleUploadBytes)} se chhoti rakhein.`
          );
          return;
        }

        setFormData((previous) => {
          const existingImages = previous.bikeImages || [];
          const filteredNewImages = newImages.filter(
            (newImg) =>
              !existingImages.some(
                (exist) => exist.name === newImg.name && exist.size === newImg.size
              )
          );
          const combined = [...existingImages, ...filteredNewImages].slice(0, maxBikeImages);

          if (existingImages.length + filteredNewImages.length > maxBikeImages) {
            setError(`Maximum ${maxBikeImages} bike images limit reached.`);
          } else {
            setError("");
          }

          return {
            ...previous,
            bikeImages: combined,
          };
        });
        return;
      }

      const preparedFile = await prepareUploadFile(files[0], name);

      if (preparedFile?.size > maxSingleUploadBytes) {
        setError(
          `${preparedFile.name} ${formatFileSize(
            preparedFile.size
          )} hai. Har file ${formatFileSize(maxSingleUploadBytes)} se chhoti rakhein.`
        );
        event.target.value = "";
        return;
      }

      setFormData((previous) => ({
        ...previous,
        [name]: preparedFile,
      }));
      setError("");
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
    if (!reviewReady) {
      setError("Partner onboarding complete karne ke liye sab required fields bhariye.");
      return;
    }

    if (!hasRequiredFiles()) {
      setError(
        "Aadhar, DL, RC, insurance, aur kam se kam 2 bike images upload karein."
      );
      return;
    }

    const submissionSize = getSubmissionSize();

    if (submissionSize > maxSubmissionBytes) {
      setError(
        `Upload total ${formatFileSize(submissionSize)} hai. Submit se pehle total files ${formatFileSize(
          maxSubmissionBytes
        )} ke andar rakhein. Images auto-compress hoti hain; large PDFs ko chhota karke upload karein.`
      );
      return;
    }

    const payload = new FormData();
    appendPartnerFormData(payload);

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const response = await api.post("/partners/applications", payload, token);
      setApplications((previous) => [response.application, ...previous]);
      setMessage("Partner onboarding submitted. Admin review pending.");
      setCurrentStep(4);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || "Request failed. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      setUpdatingBookingId(bookingId);
      setError("");
      setMessage("");
      const response = await api.patch(`/bookings/${bookingId}/accept`, {}, token);
      setAcceptedBookings((previous) => [response.booking, ...previous]);
      setAvailableBookings((previous) =>
        previous.filter((booking) => booking._id !== bookingId)
      );
      setMessage("Booking accepted. The user has been notified of their assigned partner.");
      fetchPartnerData();
    } catch (acceptError) {
      setError(acceptError.message);
    } finally {
      setUpdatingBookingId("");
    }
  };

  const updateBookingStage = async (bookingId, serviceStage) => {
    try {
      setUpdatingBookingId(bookingId);
      setError("");
      setMessage("");
      const response = await api.patch(
        `/bookings/${bookingId}/stage`,
        {
          serviceStage,
          status: serviceStage === "payment_pending" ? "confirmed" : undefined,
        },
        token
      );

      setAcceptedBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId ? response.booking : booking
        )
      );
      setMessage(
        serviceStage === "ride_in_progress"
          ? "Service marked as in-progress. User tracking screen updated."
          : "Service marked as completed. Payment option unlocked for user."
      );
      fetchPartnerData();
    } catch (stageError) {
      setError(stageError.message);
    } finally {
      setUpdatingBookingId("");
    }
  };

  const renderBookingActions = (booking) => {
    const busy = updatingBookingId === booking._id;

    if (booking.serviceStage === "partner_assigned") {
      return (
        <button
          type="button"
          onClick={() => updateBookingStage(booking._id, "ride_in_progress")}
          disabled={busy}
          className="theme-primary-button mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-70"
        >
          <PlayCircle className="h-4 w-4" />
          {busy ? "Starting..." : "Start service"}
        </button>
      );
    }

    if (booking.serviceStage === "ride_in_progress") {
      return (
        <button
          type="button"
          onClick={() => updateBookingStage(booking._id, "payment_pending")}
          disabled={busy}
          className="theme-primary-button mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-70"
        >
          <Flag className="h-4 w-4" />
          {busy ? "Completing..." : "Complete service"}
        </button>
      );
    }

    if (booking.serviceStage === "payment_pending") {
      return (
        <p className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-200">
          Payment is pending. The booking will be complete once the user confirms the payment.
        </p>
      );
    }

    if (booking.serviceStage === "paid") {
      return (
        <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4" />
          Payment completed
        </p>
      );
    }

    return null;
  };

  const renderApplicationSummary = () => {
    if (!latestApplication) {
      return null;
    }

    const infoCards = [
      { label: "Partner name", value: latestApplication.name, icon: UserRound },
      { label: "Phone", value: latestApplication.phoneNumber || "Not added", icon: Phone },
      {
        label: "Vehicle",
        value: `${latestApplication.vehicleBrand || ""} ${
          latestApplication.vehicleModel || ""
        }`.trim() || latestApplication.vehicleType || "Vehicle added",
        icon: Bike,
      },
      { label: "Vehicle no.", value: latestApplication.bikeNo, icon: ShieldCheck },
      { label: "Address", value: latestApplication.address, icon: MapPin },
      {
        label: "Bank",
        value: `${latestApplication.bankName || "Bank"} | ${maskAccount(
          latestApplication.accountNumber
        )}`,
        icon: Wallet,
      },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="theme-card-soft rounded-[28px] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="theme-accent text-xs font-semibold uppercase tracking-[0.25em]">
                Submitted Profile
              </p>
              <h3 className="mt-2 text-2xl font-black">{latestApplication.name}</h3>
              <p className="theme-text-muted mt-2 text-sm">
                This is the details submitted during partner onboarding.
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(
                latestApplication.status
              )}`}
            >
              {latestApplication.status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {infoCards.map(({ label, value, icon }) => (
              <div key={label} className="theme-card rounded-2xl p-4">
                {React.createElement(icon, { className: "theme-accent h-5 w-5" })}
                <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="theme-card-soft rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <FileText className="theme-accent h-5 w-5" />
            <h3 className="text-xl font-semibold">Admin review package</h3>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {requiredDocs.map((doc) => {
              const fileObj = latestApplication[doc];
              return (
                <div key={doc} className="theme-card flex items-center justify-between rounded-2xl p-4">
                  <span className="text-sm font-semibold uppercase">{doc}</span>
                  {fileObj ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          isOpen: true,
                          title: `${doc.toUpperCase()} Document`,
                          file: {
                            path: api.asset(fileObj.path),
                            mimetype: fileObj.mimetype,
                            filename: fileObj.filename,
                          },
                        })
                      }
                      className="text-xs font-bold text-yellow-500 hover:text-yellow-600 transition"
                    >
                      View Doc
                    </button>
                  ) : (
                    <span className="theme-text-soft text-xs">Missing</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {latestApplication.bikeImages?.length ? (
              latestApplication.bikeImages.map((image, index) => (
                <img
                  key={`${latestApplication._id}-${index}`}
                  src={api.asset(image.path)}
                  alt={`Partner vehicle ${index + 1}`}
                  onClick={() =>
                    setLightbox({
                      isOpen: true,
                      title: `Bike Image ${index + 1}`,
                      file: {
                        path: api.asset(image.path),
                        mimetype: image.mimetype,
                        filename: image.filename,
                      },
                    })
                  }
                  className="h-28 w-full rounded-2xl object-cover cursor-pointer hover:opacity-90 transition duration-200"
                />
              ))
            ) : (
              <div className="col-span-2 rounded-2xl border border-dashed border-[var(--app-border)] p-4 text-center text-sm">
                Vehicle photos missing
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderIncomingRequestCard = (booking) => {
    const busy = updatingBookingId === booking._id;

    return (
      <div key={booking._id} className="theme-card rounded-2xl p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                New ride request
              </span>
              <span className="theme-text-soft text-xs">
                Requested {formatDate(booking.createdAt)}
              </span>
            </div>
            <h4 className="mt-3 text-lg font-black">
              {booking.pickup} to {booking.destination}
            </h4>
            <p className="theme-text-muted mt-2 text-sm">
              Accepting this booking request will instantly notify the user.
            </p>
          </div>

          <button
            type="button"
            onClick={() => acceptBooking(booking._id)}
            disabled={busy}
            className="theme-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70"
          >
            <CheckCircle2 className="h-4 w-4" />
            {busy ? "Accepting..." : "Accept request"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="theme-card-soft rounded-2xl p-4">
            <UserRound className="theme-accent h-5 w-5" />
            <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
              Customer
            </p>
            <p className="mt-2 text-sm font-semibold">{booking.user?.name || "User"}</p>
            <p className="theme-text-soft mt-1 text-xs">{booking.user?.email || "No email"}</p>
          </div>
          <div className="theme-card-soft rounded-2xl p-4">
            <Phone className="theme-accent h-5 w-5" />
            <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
              Contact
            </p>
            <p className="mt-2 text-sm font-semibold">
              {booking.mobileNumber || "Not added"}
            </p>
          </div>
          <div className="theme-card-soft rounded-2xl p-4">
            <Bike className="theme-accent h-5 w-5" />
            <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
              Service
            </p>
            <p className="mt-2 text-sm font-semibold capitalize">{booking.vehicle}</p>
          </div>
          <div className="theme-card-soft rounded-2xl p-4">
            <Banknote className="theme-accent h-5 w-5" />
            <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
              Fare
            </p>
            <p className="mt-2 text-sm font-semibold">Rs. {booking.estimatedFare || 0}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="theme-card-soft rounded-2xl p-4">
            <MapPin className="h-5 w-5 text-green-600" />
            <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
              Pickup details
            </p>
            <p className="mt-2 text-sm font-semibold">{booking.pickup}</p>
          </div>
          <div className="theme-card-soft rounded-2xl p-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
              Drop details
            </p>
            <p className="mt-2 text-sm font-semibold">{booking.destination}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderRideCard = (booking) => {
    const stage = getBookingStageMeta(booking.serviceStage);

    return (
      <div key={booking._id} className="theme-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-semibold">{booking.pickup} to {booking.destination}</p>
            <p className="theme-text-soft mt-1 text-sm">
              {booking.user?.name} | {booking.user?.email || "No email"} | Rs.{" "}
              {booking.estimatedFare || 0}
            </p>
            <p className="theme-text-soft mt-1 text-sm">
              Contact: {booking.mobileNumber || "Not added"} | Vehicle: {booking.vehicle}
            </p>
          </div>
          <span className="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
            {stage.label}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="theme-card-soft rounded-2xl p-3">
            <MapPin className="h-4 w-4 text-green-600" />
            <p className="theme-text-soft mt-2 text-xs">Pickup</p>
            <p className="mt-1 text-sm font-semibold">{booking.pickup}</p>
          </div>
          <div className="theme-card-soft rounded-2xl p-3">
            <MapPin className="h-4 w-4 text-red-600" />
            <p className="theme-text-soft mt-2 text-xs">Drop</p>
            <p className="mt-1 text-sm font-semibold">{booking.destination}</p>
          </div>
          <div className="theme-card-soft rounded-2xl p-3">
            <CalendarClock className="theme-accent h-4 w-4" />
            <p className="theme-text-soft mt-2 text-xs">Requested</p>
            <p className="mt-1 text-sm font-semibold">{formatDate(booking.createdAt)}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="theme-card-soft rounded-2xl p-3">
            <Phone className="theme-accent h-4 w-4" />
            <p className="theme-text-soft mt-2 text-xs">User contact</p>
            <p className="mt-1 text-sm font-semibold">{booking.mobileNumber || "Not added"}</p>
          </div>
          <div className="theme-card-soft rounded-2xl p-3">
            <CreditCard className="theme-accent h-4 w-4" />
            <p className="theme-text-soft mt-2 text-xs">Payment status</p>
            <p className="mt-1 text-sm font-semibold capitalize">
              {booking.serviceStage === "paid"
                ? `Paid${booking.paymentMethod ? ` by ${booking.paymentMethod}` : ""}`
                : booking.serviceStage === "payment_pending"
                  ? "Waiting for user"
                  : "Locked"}
            </p>
          </div>
          <div className="theme-card-soft rounded-2xl p-3">
            <Banknote className="theme-accent h-4 w-4" />
            <p className="theme-text-soft mt-2 text-xs">Partner earning</p>
            <p className="mt-1 text-sm font-semibold">
              {booking.serviceStage === "paid" ? `Rs. ${booking.estimatedFare || 0}` : "After payment"}
            </p>
          </div>
        </div>

        <p className="theme-text-soft mt-4 text-sm">{stage.note}</p>
        {renderBookingActions(booking)}
      </div>
    );
  };

  const drawerConfig = {
    requests: {
      title: "All live requests",
      subtitle: "All available open ride requests will appear here.",
      bookings: availableBookings,
      empty: "No live requests available at the moment.",
      render: renderIncomingRequestCard,
    },
    active: {
      title: "Active ride requests",
      subtitle: "Accepted and in-progress rides with pending payments.",
      bookings: activeBookings,
      empty: "No active rides at the moment.",
      render: renderRideCard,
    },
    payments: {
      title: "Complete and payment requests",
      subtitle: "The complete history of pending and completed payments will be shown here.",
      bookings: paymentBookings,
      empty: "No completed or pending payment requests.",
      render: renderRideCard,
    },
    earnings: {
      title: "Paid completed requests",
      subtitle: "Details of earnings from completed and paid rides.",
      bookings: completedBookings,
      empty: "No paid completed requests.",
      render: renderRideCard,
    },
  };

  const renderRequestDrawer = () => {
    const activeDrawer = drawerConfig[requestDrawer];

    if (!activeDrawer) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Close requests drawer"
          onClick={() => setRequestDrawer(null)}
          className="absolute inset-0 bg-black/50"
        />
        <aside className="theme-page absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-[var(--app-border)] shadow-2xl">
          <div className="theme-card flex items-start justify-between gap-4 rounded-none border-x-0 border-t-0 p-5">
            <div>
              <p className="theme-accent text-xs font-semibold uppercase tracking-[0.25em]">
                Partner Requests
              </p>
              <h3 className="mt-2 text-2xl font-black">{activeDrawer.title}</h3>
              <p className="theme-text-muted mt-2 text-sm">{activeDrawer.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setRequestDrawer(null)}
              className="theme-secondary-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {activeDrawer.bookings.length ? (
              <div className="space-y-4">
                {activeDrawer.bookings.map((booking) => activeDrawer.render(booking))}
              </div>
            ) : (
              <div className="theme-card-soft rounded-[28px] p-6 text-center text-sm">
                {activeDrawer.empty}
              </div>
            )}
          </div>
        </aside>
      </div>
    );
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
            {requiredDocs.map((doc) => {
              const fileObj = formData[doc];
              return (
                <div key={doc} className="theme-card-soft block rounded-[28px] p-4 relative">
                  <span className="theme-text-muted mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
                    <FileText className="theme-accent h-4 w-4" />
                    {doc}
                  </span>
                  <input
                    type="file"
                    name={doc}
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    className="w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-semibold file:text-black"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="theme-text-soft text-xs truncate max-w-[70%]">
                      {fileObj ? fileObj.name : "No file selected"}
                    </p>
                    {fileObj && (
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            isOpen: true,
                            title: `${doc.toUpperCase()} Document`,
                            file: {
                              path: URL.createObjectURL(fileObj),
                              mimetype: fileObj.type,
                              filename: fileObj.name,
                            },
                          })
                        }
                        className="text-xs font-semibold text-yellow-500 hover:text-yellow-600 transition"
                      >
                        Preview Doc
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="theme-card-soft block rounded-[28px] p-4">
            <span className="theme-text-muted mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
              <ImagePlus className="theme-accent h-4 w-4" />
              Bike Images
            </span>
            <input
              type="file"
              name="bikeImages"
              multiple
              onChange={handleChange}
              accept="image/*"
              className="w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-semibold file:text-black"
            />
            <p className="theme-text-soft mt-3 text-xs">
              Upload minimum 2 and maximum {maxBikeImages} bike images. Click images to preview or "X" to delete.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {formData.bikeImages.map((image, index) => {
                const imgUrl = URL.createObjectURL(image);
                return (
                  <div
                    key={`${image.name}-${index}`}
                    className="relative group overflow-hidden rounded-2xl border border-[var(--app-border)] h-20 w-20"
                  >
                    <img
                      src={imgUrl}
                      alt="Bike preview"
                      onClick={() =>
                        setLightbox({
                          isOpen: true,
                          title: `Bike Image ${index + 1}`,
                          file: {
                            path: imgUrl,
                            mimetype: image.type,
                            filename: image.name,
                          },
                        })
                      }
                      className="h-full w-full object-cover cursor-pointer hover:scale-105 transition duration-250"
                    />
                    <button
                      type="button"
                      onClick={() => removeBikeImage(index)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white text-xs shadow-md transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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
        <div className="space-y-5">
          <div className="theme-card-soft rounded-[28px] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="theme-accent text-xs font-semibold uppercase tracking-[0.25em]">
                  Final Verification
                </p>
                <h3 className="mt-2 text-2xl font-black">Check every partner detail</h3>
                <p className="theme-text-muted mt-2 text-sm">
                  Green checkmark means details are complete. Yellow warning indicates corrections needed before submission.
                </p>
              </div>
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  reviewReady
                    ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-200"
                }`}
              >
                {completedRequiredCount}/{requiredReviewItems.length} required complete
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {reviewGroups.map((group) => {
              const completeCount = group.items.filter((item) => item.valid).length;

              return (
                <div key={group.title} className="theme-card-soft rounded-[28px] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black">{group.title}</h4>
                      <p className="theme-text-muted mt-1 text-sm">{group.note}</p>
                    </div>
                    <span className="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                      {completeCount}/{group.items.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <div
                        key={`${group.title}-${item.label}`}
                        className={`rounded-2xl border p-4 ${
                          item.valid
                            ? "border-green-500/20 bg-green-500/10"
                            : "border-yellow-500/20 bg-yellow-500/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {item.valid ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          ) : (
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{item.label}</p>
                              {item.optional ? (
                                <span className="theme-text-soft text-xs">Optional</span>
                              ) : null}
                            </div>
                            <p className="mt-1 break-words text-sm">
                              {item.valid ? item.value || "Added" : item.hint}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!reviewReady ? (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-200">
              Please complete the missing details in the previous steps to enable submission.
            </div>
          ) : (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
              Required partner details are complete. You can now submit for admin review.
            </div>
          )}
          </div>
      );
    }

    return (
      <div className="space-y-6">
        {renderApplicationSummary()}

        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "New Requests",
              value: availableBookings.length,
              icon: BellRing,
              drawer: "requests",
            },
            {
              label: "Active Rides",
              value: activeBookings.length,
              icon: PlayCircle,
              drawer: "active",
            },
            {
              label: "Complete Requests",
              value: paymentBookings.length,
              icon: CreditCard,
              drawer: "payments",
            },
            {
              label: "Earnings",
              value: `Rs. ${totalEarnings}`,
              icon: Banknote,
              drawer: "earnings",
            },
          ].map(({ label, value, icon, drawer }) => (
            <button
              key={label}
              type="button"
              onClick={() => setRequestDrawer(drawer)}
              className="theme-card-soft rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-yellow-500/40"
            >
              {React.createElement(icon, { className: "theme-accent h-5 w-5" })}
              <p className="theme-text-soft mt-3 text-xs uppercase tracking-[0.18em]">
                {label}
              </p>
              <p className="mt-2 text-2xl font-black">{value}</p>
              <p className="theme-text-soft mt-2 text-xs">Click to view all</p>
            </button>
          ))}
        </div>

        <div className="theme-card-soft rounded-[28px] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="theme-accent h-5 w-5" />
              <h3 className="text-xl font-semibold">Live Bookings</h3>
            </div>
            <button
              type="button"
              onClick={fetchPartnerData}
              className="theme-secondary-button inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {!isApproved ? (
            <p className="theme-text-soft mt-4 text-sm">
              Available bookings will appear here after admin approval.
            </p>
          ) : availableBookings.length ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-100">
                <BellRing className="mr-2 inline h-4 w-4" />
                {availableBookings.length} new booking request(s) received in partner panel.
              </div>
              {availableBookings.map((booking) => renderIncomingRequestCard(booking))}
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
              {acceptedBookings.map((booking) => renderRideCard(booking))}
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
            Vehicle details, documents, bank review, admin verification, and live
            bookings are all managed in a single connected flow.
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
                  disabled={submitting || !reviewReady}
                  className="theme-primary-button rounded-2xl px-5 py-3 font-semibold disabled:opacity-70"
                >
                  {submitting
                    ? "Submitting..."
                    : reviewReady
                      ? "Submit for admin review"
                      : "Complete missing details"}
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
      {renderRequestDrawer()}
      <LightboxModal
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ isOpen: false, title: "", file: null })}
        title={lightbox.title}
        file={lightbox.file}
      />
    </div>
  );
}

export default Partner;
