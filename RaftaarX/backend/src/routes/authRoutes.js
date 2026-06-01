import bcrypt from "bcryptjs";
import express from "express";
import mongoose from "mongoose";

import { protect } from "../middleware/auth.js";
import OtpVerification from "../models/OtpVerification.js";
import User from "../models/User.js";
import { generateToken } from "../utils/auth.js";
import { verifyGoogleCredential } from "../utils/googleAuth.js";
import {
  sendMailIfConfigured,
  sendOtpEmail,
} from "../utils/mailer.js";
import {
  generateOtp,
  getOtpExpiryDate,
  getOtpExpiryMinutes,
} from "../utils/otp.js";

const router = express.Router();
const validRoles = ["user", "partner", "admin"];
const maxOtpAttempts = 5;

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function createAuthResponse(user) {
  return {
    success: true,
    token: generateToken(user._id),
    user: serializeUser(user),
  };
}

async function sendWelcomeEmail(user) {
  await sendMailIfConfigured({
    to: user.email,
    subject: "Welcome to RaftaarX",
    text: `Hello ${user.name}, your ${user.role} account is ready on RaftaarX.`,
  });
}

async function createOtpChallenge({
  purpose,
  email,
  name,
  userId,
  pendingUser,
}) {
  await OtpVerification.deleteMany({
    purpose,
    email: email.toLowerCase(),
    consumedAt: null,
  });

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const verification = await OtpVerification.create({
    purpose,
    email,
    userId,
    pendingUser,
    otpHash,
    expiresAt: getOtpExpiryDate(),
  });

  try {
    await sendOtpEmail({
      to: email,
      name,
      otp,
      expiryMinutes: getOtpExpiryMinutes(),
    });

    return {
      success: true,
      requiresOtp: true,
      verificationId: verification._id,
      email,
      message: "OTP email sent. Please verify to continue.",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[DEVELOPMENT WARNING] Failed to send OTP email via SMTP: ${error.message}`);
      console.log(`Continuing anyway because we are in development mode. Use OTP: ${otp}`);
      return {
        success: true,
        requiresOtp: true,
        verificationId: verification._id,
        email,
        message: `OTP generated (Email simulation). Your verification code is: ${otp}`,
      };
    }
    await OtpVerification.deleteOne({ _id: verification._id });
    throw error;
  }
}


router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, role, adminKey } = req.body;

    if (!name || !email || !password || !role) {
      return next({ statusCode: 400, message: "All fields are required" });
    }

    if (!validRoles.includes(role)) {
      return next({ statusCode: 400, message: "Invalid role selected" });
    }

    if (password.length < 8) {
      return next({
        statusCode: 400,
        message: "Password must be at least 8 characters long",
      });
    }

    if (role === "admin") {
      const expectedKey = process.env.ADMIN_SIGNUP_KEY;

      if (!expectedKey || adminKey !== expectedKey) {
        return next({
          statusCode: 403,
          message: "Admin signup is protected. Enter the correct admin key.",
        });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next({ statusCode: 409, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const challenge = await createOtpChallenge({
      purpose: "signup",
      email,
      name,
      pendingUser: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(202).json(challenge);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return next({
        statusCode: 400,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next({ statusCode: 401, message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return next({ statusCode: 401, message: "Invalid credentials" });
    }

    if (role && role !== user.role) {
      return next({
        statusCode: 403,
        message: "Selected role does not match your account",
      });
    }

    const challenge = await createOtpChallenge({
      purpose: "login",
      email: user.email,
      name: user.name,
      userId: user._id,
    });

    res.status(202).json(challenge);
  } catch (error) {
    next(error);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { verificationId, otp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(verificationId) || !/^\d{6}$/.test(String(otp || ""))) {
      return next({ statusCode: 400, message: "Valid OTP is required" });
    }

    const verification = await OtpVerification.findOne({
      _id: verificationId,
      consumedAt: null,
    });

    if (!verification || verification.expiresAt.getTime() < Date.now()) {
      return next({ statusCode: 400, message: "OTP expired. Please request a new one." });
    }

    if (verification.attempts >= maxOtpAttempts) {
      return next({
        statusCode: 429,
        message: "Too many wrong OTP attempts. Please request a new OTP.",
      });
    }

    const otpMatches = await bcrypt.compare(String(otp), verification.otpHash);
    if (!otpMatches) {
      verification.attempts += 1;
      await verification.save();
      return next({ statusCode: 401, message: "Invalid OTP" });
    }

    verification.consumedAt = new Date();
    await verification.save();

    if (verification.purpose === "signup") {
      const pendingUser = verification.pendingUser;
      const existingUser = await User.findOne({
        email: pendingUser.email.toLowerCase(),
      });

      if (existingUser) {
        return next({
          statusCode: 409,
          message: "Email is already registered",
        });
      }

      const user = await User.create({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
        role: pendingUser.role,
      });

      await sendWelcomeEmail(user);

      return res.status(201).json(createAuthResponse(user));
    }

    const user = await User.findById(verification.userId);
    if (!user) {
      return next({ statusCode: 404, message: "Account not found" });
    }

    res.json(createAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential || !role) {
      return next({
        statusCode: 400,
        message: "Google credential and role are required",
      });
    }

    if (!["user", "partner"].includes(role)) {
      return next({
        statusCode: 400,
        message: "Google sign-in is available for user and partner roles only",
      });
    }

    const payload = await verifyGoogleCredential(credential);

    if (!payload?.email) {
      return next({ statusCode: 400, message: "Google account email not found" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (user && user.role !== role) {
      return next({
        statusCode: 403,
        message: "This Google account is already linked to another role",
      });
    }

    if (!user) {
      const challenge = await createOtpChallenge({
        purpose: "signup",
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        pendingUser: {
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          password: await bcrypt.hash(`${payload.sub}-${Date.now()}`, 10),
          role,
        },
      });

      return res.status(202).json(challenge);
    }

    const challenge = await createOtpChallenge({
      purpose: "login",
      email: user.email,
      name: user.name,
      userId: user._id,
    });

    res.status(202).json(challenge);
  } catch (error) {
    next({
      statusCode: 401,
      message: "Google sign-in failed",
    });
  }
});

router.post("/resend-otp", async (req, res, next) => {
  try {
    const { verificationId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(verificationId)) {
      return next({ statusCode: 400, message: "Valid verification session ID is required" });
    }

    const verification = await OtpVerification.findById(verificationId);

    if (!verification || verification.consumedAt) {
      return next({
        statusCode: 404,
        message: "Verification session not found or already completed.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    verification.otpHash = otpHash;
    verification.attempts = 0;
    verification.expiresAt = getOtpExpiryDate();
    await verification.save();

    try {
      await sendOtpEmail({
        to: verification.email,
        name: verification.pendingUser?.name || "there",
        otp,
        expiryMinutes: getOtpExpiryMinutes(),
      });

      res.json({
        success: true,
        message: "New OTP code sent successfully.",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[DEVELOPMENT WARNING] Failed to send resend-OTP email: ${error.message}`);
        console.log(`Continuing anyway because we are in development mode. Use new OTP: ${otp}`);
        return res.json({
          success: true,
          message: `New OTP generated (Email simulation). Your verification code is: ${otp}`,
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});


export default router;
