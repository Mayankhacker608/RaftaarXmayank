import nodemailer from "nodemailer";

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendMailIfConfigured(options) {
  const transporter = createTransporter();

  if (!transporter) {
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      ...options,
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
}
