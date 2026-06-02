import express from "express";

import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import PartnerApplication from "../models/PartnerApplication.js";
import { toStoredFile } from "../utils/files.js";
import { sendMailIfConfigured } from "../utils/mailer.js";

const router = express.Router();

router.post(
  "/applications",
  protect,
  authorize("partner"),
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "dl", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
    { name: "bikeImages", maxCount: 10 },
  ]),
  async (req, res, next) => {
    try {
      const {
        name,
        fatherName,
        address,
        bikeNo,
        phoneNumber,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        pricingPlan,
        pricePerKm,
      } = req.body;
      const files = req.files || {};

      if (!name || !fatherName || !address || !bikeNo) {
        return next({ statusCode: 400, message: "All fields are required" });
      }

      if (
        !files.aadhar?.[0] ||
        !files.dl?.[0] ||
        !files.rc?.[0] ||
        !files.insurance?.[0] ||
        !files.bikeImages ||
        files.bikeImages.length < 2
      ) {
        return next({
          statusCode: 400,
          message: "Upload all required documents and at least 2 bike images",
        });
      }

      const application = await PartnerApplication.create({
        user: req.user._id,
        name,
        fatherName,
        address,
        bikeNo,
        phoneNumber,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        aadhar: toStoredFile(files.aadhar[0]),
        dl: toStoredFile(files.dl[0]),
        rc: toStoredFile(files.rc[0]),
        insurance: toStoredFile(files.insurance[0]),
        bikeImages: files.bikeImages.map(toStoredFile),
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode,
        pricingPlan,
        pricePerKm: Number(pricePerKm) || 0,
      });

      await sendMailIfConfigured({
        to: req.user.email,
        subject: "RaftaarX partner application received",
        text: `Hello ${req.user.name}, your partner application for bike ${bikeNo} has been received.`,
      });

      if (process.env.EMAIL_USER) {
        await sendMailIfConfigured({
          to: process.env.EMAIL_USER,
          subject: "New partner application on RaftaarX",
          text: `Partner ${req.user.name} submitted a new application for bike ${bikeNo}.`,
        });
      }

      res.status(201).json({ success: true, application });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me", protect, authorize("partner"), async (req, res, next) => {
  try {
    const applications = await PartnerApplication.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
});

export default router;
