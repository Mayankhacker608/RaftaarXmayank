import express from "express";

import { authorize, protect } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import PartnerApplication from "../models/PartnerApplication.js";

const router = express.Router();

const partnerStages = ["ride_in_progress", "payment_pending"];
const userStages = ["paid"];

function populateBooking(query) {
  return query.populate("user", "name email").populate("partner", "name email");
}

async function populateBookingDocument(booking) {
  await booking.populate("user", "name email");
  await booking.populate("partner", "name email");
  return booking;
}

router.post("/", protect, authorize("user"), async (req, res, next) => {
  try {
    const {
      pickup,
      pickupLocation,
      destination,
      destinationLocation,
      vehicle,
      mobileNumber,
      distanceKm,
      estimatedFare,
    } = req.body;

    if (!pickup || !destination || !vehicle) {
      return next({
        statusCode: 400,
        message: "Pickup, destination, and vehicle are required",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      pickup,
      pickupLocation,
      destination,
      destinationLocation,
      vehicle,
      mobileNumber,
      distanceKm: Number(distanceKm) || 0,
      estimatedFare: Number(estimatedFare) || 0,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, authorize("user"), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("partner", "name email")
      .sort({
        createdAt: -1,
      });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

router.get("/available", protect, authorize("partner"), async (req, res, next) => {
  try {
    const approvedApplication = await PartnerApplication.findOne({
      user: req.user._id,
      status: "approved",
    });

    if (!approvedApplication) {
      return next({
        statusCode: 403,
        message: "Only approved partners can accept bookings",
      });
    }

    const bookings = await Booking.find({
      partner: null,
      status: "pending",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

router.get("/assigned", protect, authorize("partner"), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ partner: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/accept", protect, authorize("partner"), async (req, res, next) => {
  try {
    const approvedApplication = await PartnerApplication.findOne({
      user: req.user._id,
      status: "approved",
    });

    if (!approvedApplication) {
      return next({
        statusCode: 403,
        message: "Partner approval required before accepting bookings",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next({
        statusCode: 404,
        message: "Booking not found",
      });
    }

    if (booking.partner) {
      return next({
        statusCode: 409,
        message: "Booking already accepted by another partner",
      });
    }

    if (booking.status === "completed" || booking.serviceStage === "paid") {
      return next({
        statusCode: 409,
        message: "Completed bookings cannot be accepted",
      });
    }

    booking.partner = req.user._id;
    booking.status = "confirmed";
    booking.serviceStage = "partner_assigned";
    await booking.save();

    res.json({ success: true, booking: await populateBookingDocument(booking) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/stage", protect, async (req, res, next) => {
  try {
    const { serviceStage, status, paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next({ statusCode: 404, message: "Booking not found" });
    }

    const isUser = booking.user.toString() === req.user._id.toString();
    const isPartner =
      booking.partner && booking.partner.toString() === req.user._id.toString();

    if (!isUser && !isPartner && req.user.role !== "admin") {
      return next({ statusCode: 403, message: "Not allowed" });
    }

    if (serviceStage) {
      const partnerCanUpdate = isPartner && partnerStages.includes(serviceStage);
      const userCanPay =
        isUser && userStages.includes(serviceStage) && booking.serviceStage === "payment_pending";
      const adminCanUpdate = req.user.role === "admin";

      if (!partnerCanUpdate && !userCanPay && !adminCanUpdate) {
        return next({
          statusCode: 403,
          message: "This booking stage cannot be updated from your account",
        });
      }

      booking.serviceStage = serviceStage;
    }

    if (status) {
      booking.status = status;
    }

    if (serviceStage === "paid") {
      booking.status = "completed";
      booking.paymentMethod = paymentMethod || booking.paymentMethod || "upi";
      booking.paidAt = new Date();
    }

    await booking.save();
    await booking.populate("user", "name email");
    await booking.populate("partner", "name email");

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

export default router;
