import express from "express";

import { authorize, protect } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import PartnerApplication from "../models/PartnerApplication.js";

const router = express.Router();

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

    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        partner: null,
      },
      {
        partner: req.user._id,
        status: "confirmed",
        serviceStage: "partner_assigned",
      },
      { new: true }
    ).populate("partner", "name email");

    if (!booking) {
      return next({
        statusCode: 404,
        message: "Booking no longer available",
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/stage", protect, async (req, res, next) => {
  try {
    const { serviceStage, status } = req.body;
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
      booking.serviceStage = serviceStage;
    }

    if (status) {
      booking.status = status;
    }

    await booking.save();
    await booking.populate("partner", "name email");

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

export default router;
