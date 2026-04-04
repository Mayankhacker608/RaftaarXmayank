import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Eye, XCircle } from "lucide-react";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

function Admin() {
  const { token, user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
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

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/admin/partners/${id}/status`, { status }, token);
      setPartners((previous) =>
        previous.map((partner) =>
          partner._id === id ? response.partner : partner
        )
      );
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-400">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6 text-white sm:px-6">
      <p className="mb-4 text-center text-gray-300">Welcome, {user?.name}</p>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10 text-center text-3xl font-bold text-yellow-400 sm:text-4xl"
      >
        Admin Dashboard
      </motion.h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-800 p-5">
          <p className="text-sm text-gray-400">Partner Applications</p>
          <p className="mt-2 text-3xl font-bold">{partners.length}</p>
        </div>
        <div className="rounded-2xl bg-gray-800 p-5">
          <p className="text-sm text-gray-400">Approved Partners</p>
          <p className="mt-2 text-3xl font-bold">
            {partners.filter((partner) => partner.status === "approved").length}
          </p>
        </div>
        <div className="rounded-2xl bg-gray-800 p-5">
          <p className="text-sm text-gray-400">Bookings</p>
          <p className="mt-2 text-3xl font-bold">{bookings.length}</p>
        </div>
      </div>

      {!partners.length && (
        <div className="mb-8 rounded-2xl bg-gray-800 p-6 text-center text-gray-400">
          No partner applications found yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {partners.map((partner) => (
          <motion.div
            key={partner._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="flex flex-col gap-4 rounded-2xl bg-gray-800 p-5 shadow-lg sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold sm:text-2xl">{partner.name}</h2>
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  partner.status === "approved"
                    ? "bg-green-600"
                    : partner.status === "rejected"
                    ? "bg-red-600"
                    : "bg-yellow-500"
                }`}
              >
                {partner.status.toUpperCase()}
              </span>
            </div>

            <p>Email: {partner.user?.email}</p>
            <p>Father's Name: {partner.fatherName}</p>
            <p>Address: {partner.address}</p>
            <p>Bike No: {partner.bikeNo}</p>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {["aadhar", "dl", "rc", "insurance"].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded bg-gray-700 p-2 hover:bg-gray-600"
                >
                  <span className="truncate">{doc.toUpperCase()}</span>
                  {partner[doc] ? (
                    <a
                      href={api.asset(partner[doc].path)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye className="text-yellow-400" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">No file</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {partner.bikeImages?.length ? (
                partner.bikeImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={api.asset(img.path)}
                    alt={`Bike ${idx + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ))
              ) : (
                <span className="text-gray-400">No bike images uploaded</span>
              )}
            </div>

            {partner.status === "pending" && (
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateStatus(partner._id, "approved")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-bold text-black"
                >
                  <CheckCircle /> Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateStatus(partner._id, "rejected")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 font-bold text-black"
                >
                  <XCircle /> Reject
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-gray-800 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-yellow-400">Recent Bookings</h2>
        {bookings.length ? (
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col gap-2 rounded-xl bg-gray-900/80 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{booking.user?.name}</p>
                  <p className="text-sm text-gray-400">
                    {booking.pickup} to {booking.destination}
                  </p>
                </div>
                <div className="text-sm text-gray-300">
                  {booking.vehicle} | {booking.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-400">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}

export default Admin;
