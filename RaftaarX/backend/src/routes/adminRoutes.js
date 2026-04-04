import express from "express";

import { authorize, protect } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import PartnerApplication from "../models/PartnerApplication.js";

const router = express.Router();

router.get("/partners", protect, authorize("admin"), async (_req, res, next) => {
  try {
    const partners = await PartnerApplication.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, partners });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/partners/:id/status",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return next({
          statusCode: 400,
          message: "Status must be approved or rejected",
        });
      }

      const partner = await PartnerApplication.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate("user", "name email role");

      if (!partner) {
        return next({
          statusCode: 404,
          message: "Partner application not found",
        });
      }

      res.json({ success: true, partner });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/bookings", protect, authorize("admin"), async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

export default router;
