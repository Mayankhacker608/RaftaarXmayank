import express from "express";

import { authorize, protect } from "../middleware/auth.js";
import Booking from "../models/Booking.js";

const router = express.Router();

router.post("/", protect, authorize("user"), async (req, res, next) => {
  try {
    const { pickup, destination, vehicle } = req.body;

    if (!pickup || !destination || !vehicle) {
      return next({
        statusCode: 400,
        message: "Pickup, destination, and vehicle are required",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      pickup,
      destination,
      vehicle,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, authorize("user"), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

export default router;
