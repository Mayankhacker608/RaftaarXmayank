import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

function Partner() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    address: "",
    bikeNo: "",
    aadhar: null,
    dl: null,
    rc: null,
    insurance: null,
    bikeImages: [],
  });
  const [uploadStatus, setUploadStatus] = useState({
    aadhar: false,
    dl: false,
    rc: false,
    insurance: false,
    bikeImages: false,
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const response = await api.get("/partners/me", token);
      setApplications(response.applications);
      setPartnerStatus(response.applications[0]?.status || null);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleChange = (event) => {
    const { name, files, value } = event.target;

    if (files) {
      if (name === "bikeImages") {
        setFormData((previous) => ({ ...previous, bikeImages: Array.from(files) }));
        setUploadStatus((previous) => ({
          ...previous,
          bikeImages: files.length >= 2,
        }));
      } else {
        setFormData((previous) => ({ ...previous, [name]: files[0] }));
        setUploadStatus((previous) => ({ ...previous, [name]: true }));
      }
      return;
    }

    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.fatherName ||
      !formData.address ||
      !formData.bikeNo ||
      !formData.aadhar ||
      !formData.dl ||
      !formData.rc ||
      !formData.insurance ||
      formData.bikeImages.length < 2
    ) {
      setError("Please fill all fields and upload minimum 2 bike images");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("fatherName", formData.fatherName);
    payload.append("address", formData.address);
    payload.append("bikeNo", formData.bikeNo);
    payload.append("aadhar", formData.aadhar);
    payload.append("dl", formData.dl);
    payload.append("rc", formData.rc);
    payload.append("insurance", formData.insurance);
    formData.bikeImages.forEach((image) => payload.append("bikeImages", image));

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const response = await api.post("/partners/applications", payload, token);
      setPartnerStatus(response.application.status);
      setMessage("Registration submitted successfully.");
      await fetchApplications();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gray-900 px-4 py-6 font-sans text-white sm:px-6">
      <motion.button
        type="button"
        onClick={() => navigate("/auth")}
        whileHover={{ scale: 1.05 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 shadow-lg"
      >
        <ArrowLeft className="text-yellow-400" />
        Back
      </motion.button>

      <motion.h1 className="mb-3 text-center text-3xl font-extrabold tracking-wide text-yellow-400 sm:text-4xl md:text-5xl">
        Partner Registration
      </motion.h1>
      <p className="mb-8 text-center text-gray-300">
        Welcome, {user?.name}. Documents upload karke partner approval track kijiye.
      </p>

      <motion.form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-gray-900 p-5 shadow-2xl sm:p-8"
      >
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="flex-1 rounded-lg bg-gray-800 p-3 text-white outline-none placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Father's Name"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            className="flex-1 rounded-lg bg-gray-800 p-3 text-white outline-none placeholder-gray-400"
          />
        </div>

        <input
          type="text"
          placeholder="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none placeholder-gray-400"
        />

        <input
          type="text"
          placeholder="Bike Number"
          name="bikeNo"
          value={formData.bikeNo}
          onChange={handleChange}
          className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none placeholder-gray-400"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {["aadhar", "dl", "rc", "insurance"].map((doc) => (
            <motion.div
              key={doc}
              whileHover={{ scale: 1.02 }}
              className="relative flex flex-col rounded-lg bg-gray-800 p-4"
            >
          <label className="mb-1 text-sm text-gray-300 uppercase">{doc}</label>
              <input
                type="file"
                name={doc}
                onChange={handleChange}
                accept="image/*,.pdf"
                className="w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-yellow-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
              {uploadStatus[doc] && (
                <CheckCircle className="absolute right-3 top-3 text-green-400" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div className="relative flex flex-col rounded-lg bg-gray-800 p-4">
          <label className="mb-1 text-gray-300">Bike Images (minimum 2)</label>
          <input
            type="file"
            name="bikeImages"
            multiple
            onChange={handleChange}
            accept="image/*"
            className="w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-yellow-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
          />
          {uploadStatus.bikeImages && (
            <CheckCircle className="absolute right-3 top-3 text-green-400" />
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.bikeImages.map((img, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(img)}
                alt="bike"
                className="h-20 w-20 rounded border-2 border-gray-600 object-cover"
              />
            ))}
          </div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black shadow-lg transition-all hover:shadow-yellow-400/50 disabled:opacity-70"
        >
          {submitting ? "Submitting..." : "Submit Registration"}
        </motion.button>

        {partnerStatus && (
          <motion.div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-700 p-4 text-center font-semibold text-yellow-400 sm:flex-row">
            <CheckCircle className="text-green-400" />
            {partnerStatus !== "pending"
              ? `Status: ${partnerStatus.toUpperCase()}`
              : "Registration submitted. Admin approval pending."}
          </motion.div>
        )}
      </motion.form>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-gray-800/70 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white">Previous Applications</h2>
        {loading ? (
          <p className="mt-4 text-gray-400">Loading applications...</p>
        ) : applications.length ? (
          <div className="mt-4 space-y-3">
            {applications.map((application) => (
              <div
                key={application._id}
                className="flex flex-col gap-2 rounded-xl bg-gray-900/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{application.bikeNo}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm uppercase text-yellow-300">
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-400">No applications yet.</p>
        )}
      </div>
    </motion.div>
  );
}

export default Partner;
