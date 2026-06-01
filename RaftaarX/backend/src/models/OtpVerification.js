import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      enum: ["signup", "login"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pendingUser: {
      name: String,
      email: String,
      password: String,
      role: {
        type: String,
        enum: ["user", "partner", "admin"],
      },
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
    consumedAt: Date,
  },
  { timestamps: true }
);

otpVerificationSchema.index({ purpose: 1, email: 1, consumedAt: 1 });

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

export default OtpVerification;
