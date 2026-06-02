import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  CheckCircle2,
  CreditCard,
  Eye,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";
import LightboxModal from "../components/LightboxModal.jsx";

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function badgeClass(status) {
  if (status === "approved" || status === "completed") {
    return "bg-green-500/15 text-green-300";
  }

  if (status === "rejected") {
    return "bg-red-500/15 text-red-300";
  }

  if (status === "confirmed") {
    return "bg-blue-500/15 text-blue-300";
  }

  return "bg-yellow-500/15 text-yellow-300";
}

function stageClass(stage) {
  if (stage === "paid") {
    return "bg-green-500/15 text-green-300";
  }

  if (stage === "payment_pending") {
    return "bg-yellow-500/15 text-yellow-200";
  }

  if (stage === "ride_in_progress") {
    return "bg-blue-500/15 text-blue-300";
  }

  if (stage === "partner_assigned") {
    return "bg-cyan-500/15 text-cyan-300";
  }

  return "bg-white/10 text-gray-300";
}

function stageLabel(stage) {
  return (stage || "finding_driver").replaceAll("_", " ");
}

function Admin() {
  const { token, user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("partners");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState({ isOpen: false, title: "", file: null });

  const loadDashboard = useCallback(async () => {
    try {
      setError("");
      const [partnersResponse, bookingsResponse] = await Promise.all([
        api.get("/admin/partners", token),
        api.get("/admin/bookings", token),
      ]);

      setPartners(partnersResponse.partners);
      setBookings(bookingsResponse.bookings);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 7000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const dashboardStats = useMemo(
    () => [
      {
        label: "Applications",
        value: partners.length,
        icon: LayoutDashboard,
      },
      {
        label: "Pending Review",
        value: partners.filter((partner) => partner.status === "pending").length,
        icon: ShieldCheck,
      },
      {
        label: "Approved Partners",
        value: partners.filter((partner) => partner.status === "approved").length,
        icon: UserRoundCheck,
      },
      {
        label: "Bookings",
        value: bookings.length,
        icon: Bike,
      },
      {
        label: "Completed Payments",
        value: bookings.filter((booking) => booking.serviceStage === "paid").length,
        icon: CreditCard,
      },
    ],
    [bookings, partners]
  );

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const response = await api.patch(`/admin/partners/${id}/status`, { status }, token);
      setPartners((previous) =>
        previous.map((partner) =>
          partner._id === id ? response.partner : partner
        )
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-gray-300">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-center text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_28%),linear-gradient(160deg,#020617,#0f172a,#111827)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
                Admin Control Room
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Welcome, {user?.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-gray-300 sm:text-base">
                Manage partner approvals, booking activity, and operational overview all from a single dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
              {partners.filter((partner) => partner.status === "pending").length} pending
              applications need review
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {dashboardStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <item.icon className="h-6 w-6 text-yellow-400" />
                <p className="mt-4 text-sm text-gray-300">{item.label}</p>
                <p className="mt-2 text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Partner Applications", value: "partners" },
                { label: "Recent Bookings", value: "bookings" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    activeTab === tab.value
                      ? "bg-yellow-400 text-black"
                      : "border border-white/10 bg-white/5 text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {activeTab === "partners" ? (
            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              {partners.length ? (
                partners.map((partner) => (
                  <motion.div
                    key={partner._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[28px] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">{partner.name}</h2>
                        <p className="mt-1 text-sm text-gray-400">
                          {partner.user?.email}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClass(
                          partner.status
                        )}`}
                      >
                        {partner.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                      <p>
                        <span className="text-gray-400">Father:</span> {partner.fatherName}
                      </p>
                      <p>
                        <span className="text-gray-400">Bike:</span> {partner.bikeNo}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="text-gray-400">Address:</span> {partner.address}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {["aadhar", "dl", "rc", "insurance"].map((doc) => (
                        <div
                          key={doc}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <span className="text-xs uppercase tracking-[0.18em] text-gray-300">
                            {doc}
                          </span>
                          {partner[doc] ? (
                            <button
                              type="button"
                              onClick={() =>
                                setLightbox({
                                  isOpen: true,
                                  title: `${doc.toUpperCase()} Document - ${partner.name}`,
                                  file: {
                                    path: api.asset(partner[doc].path),
                                    mimetype: partner[doc].mimetype,
                                    filename: partner[doc].filename,
                                  },
                                })
                              }
                              className="inline-flex items-center gap-1 text-sm text-yellow-300 hover:text-yellow-400 transition bg-transparent border-0 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              Open
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500">Missing</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {partner.bikeImages?.length ? (
                        partner.bikeImages.map((img, index) => (
                          <img
                            key={`${partner._id}-${index}`}
                            src={api.asset(img.path)}
                            alt={`Bike ${index + 1}`}
                            onClick={() =>
                              setLightbox({
                                isOpen: true,
                                title: `Bike Image ${index + 1} - ${partner.name}`,
                                file: {
                                  path: api.asset(img.path),
                                  mimetype: img.mimetype,
                                  filename: img.filename,
                                },
                              })
                            }
                            className="h-28 w-full rounded-2xl object-cover cursor-pointer hover:opacity-85 transition duration-200"
                          />
                        ))
                      ) : (
                        <div className="col-span-2 rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-gray-500">
                          No bike images uploaded
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => updateStatus(partner._id, "approved")}
                        disabled={partner.status !== "pending" || updatingId === partner._id}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(partner._id, "rejected")}
                        disabled={partner.status !== "pending" || updatingId === partner._id}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400 xl:col-span-2">
                  No partner applications found yet.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5">
              {bookings.length ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-semibold text-white">{booking.user?.name}</p>
                          <p className="mt-1 text-sm text-gray-400">{booking.user?.email}</p>
                          <p className="mt-3 text-sm text-gray-300">
                            {booking.pickup} to {booking.destination}
                          </p>
                          <p className="mt-2 text-sm text-gray-400">
                            Partner: {booking.partner?.name || "Not accepted yet"} | Fare: Rs.{" "}
                            {booking.estimatedFare || 0}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 lg:items-end">
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClass(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${stageClass(
                                booking.serviceStage
                              )}`}
                            >
                              {stageLabel(booking.serviceStage)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 capitalize">
                            {booking.vehicle} | {formatDate(booking.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Payment:{" "}
                            {booking.paymentMethod
                              ? booking.paymentMethod.toUpperCase()
                              : booking.serviceStage === "payment_pending"
                                ? "Pending from user"
                                : "Not unlocked"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">
                  No bookings available right now.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <LightboxModal
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ isOpen: false, title: "", file: null })}
        title={lightbox.title}
        file={lightbox.file}
      />
    </div>
  );
}

export default Admin;
