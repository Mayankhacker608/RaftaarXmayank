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
  },
  { timestamps: true }
);

const PartnerApplication = mongoose.model(
  "PartnerApplication",
  partnerApplicationSchema
);

export default PartnerApplication;
