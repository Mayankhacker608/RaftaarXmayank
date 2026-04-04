import bcrypt from "bcryptjs";
import express from "express";

import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import { generateToken } from "../utils/auth.js";
import { verifyGoogleCredential } from "../utils/googleAuth.js";
import { sendMailIfConfigured } from "../utils/mailer.js";

const router = express.Router();
const validRoles = ["user", "partner", "admin"];

async function sendWelcomeEmail(user) {
  await sendMailIfConfigured({
    to: user.email,
    subject: "Welcome to RaftaarX",
    text: `Hello ${user.name}, your ${user.role} account is ready on RaftaarX.`,
  });
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
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await sendWelcomeEmail(user);

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
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

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
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
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        password: await bcrypt.hash(`${payload.sub}-${Date.now()}`, 10),
        role,
      });

      await sendWelcomeEmail(user);
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next({
      statusCode: 401,
      message: "Google sign-in failed",
    });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
