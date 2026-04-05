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
      const { status, videoKycStatus } = req.body;
      const update = {};

      if (status) {
        if (!["approved", "rejected"].includes(status)) {
          return next({
            statusCode: 400,
            message: "Status must be approved or rejected",
          });
        }

        update.status = status;
      }

      if (videoKycStatus) {
        if (!["pending", "verified"].includes(videoKycStatus)) {
          return next({
            statusCode: 400,
            message: "Video KYC status must be pending or verified",
          });
        }

        update.videoKycStatus = videoKycStatus;
      }

      if (!Object.keys(update).length) {
        return next({
          statusCode: 400,
          message: "Status or video KYC update is required",
        });
      }

      const partner = await PartnerApplication.findByIdAndUpdate(
        req.params.id,
        update,
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
      .populate("partner", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

export default router;
