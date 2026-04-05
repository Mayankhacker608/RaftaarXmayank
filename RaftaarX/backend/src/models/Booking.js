import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickup: {
      type: String,
      required: true,
      trim: true,
    },
    pickupLocation: {
      label: { type: String, trim: true },
      lat: Number,
      lng: Number,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    destinationLocation: {
      label: { type: String, trim: true },
      lat: Number,
      lng: Number,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    vehicle: {
      type: String,
      enum: ["bike", "cab", "auto"],
      required: true,
    },
    distanceKm: {
      type: Number,
      min: 0,
      default: 0,
    },
    estimatedFare: {
      type: Number,
      min: 0,
      default: 0,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
    },
    serviceStage: {
      type: String,
      enum: [
        "finding_driver",
        "partner_assigned",
        "ride_in_progress",
        "payment_pending",
        "paid",
      ],
      default: "finding_driver",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
