import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    originalname: String,
    mimetype: String,
    path: String,
    dataUrl: String,
  },
  { _id: false }
);

const partnerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    vehicleType: {
      type: String,
      trim: true,
    },
    vehicleBrand: {
      type: String,
      trim: true,
    },
    vehicleModel: {
      type: String,
      trim: true,
    },
    vehicleColor: {
      type: String,
      trim: true,
    },
    bikeNo: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    aadhar: fileSchema,
    dl: fileSchema,
    rc: fileSchema,
    insurance: fileSchema,
    bikeImages: [fileSchema],
    bankName: {
      type: String,
      trim: true,
    },
    accountHolderName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    videoKycStatus: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    pricingPlan: {
      type: String,
      trim: true,
    },
    pricePerKm: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const PartnerApplication = mongoose.model(
  "PartnerApplication",
  partnerApplicationSchema
);

export default PartnerApplication;
