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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

export async function sendRequiredMail(options) {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error(
      "Email service is not configured. Add EMAIL_USER and EMAIL_PASS to send OTP emails."
    );
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      ...options,
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
    throw new Error("Could not send OTP email. Please try again.");
  }
}

export async function sendOtpEmail({ to, name, otp, expiryMinutes }) {
  const greetingName = name || "there";
  const safeGreetingName = escapeHtml(greetingName);

  if (process.env.NODE_ENV !== "production") {
    console.log("\n==================================================");
    console.log(`[DEVELOPMENT] OTP Email for: ${to}`);
    console.log(`Greeting: Hello ${greetingName}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: ${expiryMinutes} minutes`);
    console.log("==================================================\n");
  }

  await sendRequiredMail({
    to,
    subject: "Your RaftaarX verification code",
    text: `Hello ${greetingName}, your RaftaarX verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <p>Hello ${safeGreetingName},</p>
        <p>Your RaftaarX verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
        <p>This code expires in ${expiryMinutes} minutes.</p>
      </div>
    `,
  });
}

